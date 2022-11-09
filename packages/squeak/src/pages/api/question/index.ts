import { JSONSchemaType } from 'ajv'
import { NextApiRequest, NextApiResponse } from 'next'
import xss from 'xss'
import slugify from 'slugify'
import { Reply } from '@prisma/client'
import nc from 'next-connect'

import prisma from '../../../lib/db'
import getUserProfile from '../../../util/getUserProfile'
import sendQuestionAlert from '../../../util/sendQuestionAlert'
import { allowedOrigin, corsMiddleware, validateBody } from '../../../lib/middleware'
import { getSessionUser } from '../../../lib/auth'
import { notAuthenticated, safeJson } from '../../../lib/api/apiUtils'

export interface CreateQuestionRequestPayload {
    body: string
    slug: string
    subject: string
    organizationId: string
}

export interface CreateQuestionResponse {
    messageId: bigint
    profileId: string
    subject: string
    body: string
    slug: string[]
    published: boolean
}

const schema: JSONSchemaType<CreateQuestionRequestPayload> = {
    type: 'object',
    properties: {
        body: { type: 'string' },
        slug: { type: 'string', nullable: true },
        organizationId: { type: 'string' },
        subject: { type: 'string' },
    },
    required: ['body', 'organizationId', 'subject'],
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .get(doGet)
    .post(validateBody(schema, { coerceTypes: true }), doPost)

async function doGet(req: NextApiRequest, res: NextApiResponse) {
    const { organizationId, permalink } = req.query as { organizationId: string; permalink: string }

    if (organizationId && permalink) {
        const config = await prisma.squeakConfig.findFirst({
            where: { organization_id: organizationId },
            select: { permalink_base: true },
        })

        if (permalink.startsWith(`/${config?.permalink_base}/`)) {
            const question = await getQuestion(organizationId, permalink.replace(`/${config?.permalink_base}/`, ''))
            return safeJson(res, question)
        } else {
            return res.status(404).json({ error: 'Question not found' })
        }
    } else {
        return res.status(500).json({ error: 'Missing required params' })
    }
}

// POST /api/question
// Endpoint used by sdk to allow end users to create questions
async function doPost(req: NextApiRequest, res: NextApiResponse) {
    const { slug, subject, body: rawBody, organizationId }: CreateQuestionRequestPayload = req.body

    const body = xss(rawBody, {
        whiteList: {},
        stripIgnoreTag: true,
    })

    const user = await getSessionUser(req)
    if (!user) return notAuthenticated(res)

    const { data: userProfile, error: userProfileError } = await getUserProfile({
        organizationId,
        user,
    })

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Question] Error fetching user profile`)
        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Question] ${userProfileError}`)
            res.json({ error: userProfileError })
        }

        return
    }

    // Fetch auto_publish config for this organization
    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: { question_auto_publish: true },
    })

    if (!config) {
        console.error(`[🧵 Question] Error fetching config`)
        res.status(500).json({ error: 'Error fetching config' })

        return
    }

    // generate a permalink from the subject
    let permalink = slugify(subject, {
        lower: true,
    })

    // Ensure the permalink is unique
    const existing = await prisma.question.findFirst({
        where: { permalink, organization_id: organizationId },
        select: { permalink: true },
    })

    // Create the question in the database
    const message = await prisma.question.create({
        data: {
            slug: [slug],
            profile_id: userProfile.id,
            subject,
            published: config.question_auto_publish,
            organization_id: organizationId,
            permalink,
        },
    })

    if (!message) {
        console.error(`[🧵 Question] Error creating message`)
        res.status(500).json({ error: 'Error creating message' })

        return
    }

    // If a question with this permalink already exists, update the new question a modified
    // permalink to make it unique.
    // TODO: We should clean this up so we don't rely on the new message's ID, which means we briefly
    //   have two records with the same permalink
    if (existing) {
        permalink = `${permalink}-${message}`
        await prisma.question.update({
            where: { id: message.id },
            data: { permalink },
        })
    }

    // The question author's message is modeled as the first reply to the question
    const reply = await prisma.reply.create({
        data: {
            body,
            message_id: message.id,
            organization_id: organizationId,
            profile_id: userProfile.id,
            published: true,
        },
    })

    if (!reply) {
        console.error(`[🧵 Question] Error creating reply`)
        res.status(500).json({ error: 'Error creating reply' })

        return
    }

    const response: CreateQuestionResponse = {
        messageId: message.id,
        profileId: userProfile.id,
        subject,
        body,
        slug: [slug],
        published: message.published,
    }

    safeJson(res, response, 201)
    await sendQuestionAlert(organizationId, message.id, subject, body, slug, userProfile.id)
}

type ReplyWithMetadata = Reply & {
    metadata: { role?: string }
}

async function getQuestion(organizationId: string, permalink: string) {
    const question = await prisma.question.findFirst({
        where: {
            organization_id: organizationId,
            [permalink ? 'permalink' : 'id']: permalink,
        },
        select: {
            subject: true,
            id: true,
            slug: true,
            created_at: true,
            published: true,
            replies: true,
            slack_timestamp: true,
            resolved: true,
            resolved_reply_id: true,
            permalink: true,
        },
    })

    if (!question) {
        return {
            question: null,
            replies: [],
        }
    }

    const replies = await prisma.reply.findMany({
        where: { message_id: question.id },
        orderBy: { created_at: 'asc' },
        select: {
            id: true,
            body: true,
            created_at: true,
            published: true,
            profile: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                    role: true,
                },
            },
        },
    })

    // This is a hacky way to replicate replicate the `profiles_readonly` field on the `metadata` field.
    // The supbase query library allowed a syntax for querying a relationship and mapping it to a virtual
    // attribute on the parent object.
    const repliesW: ReplyWithMetadata[] = (replies || []).map((reply) => {
        const replyWithMetadata: any = {
            ...reply,
            metadata: {
                role: reply.profile?.role,
            },
        }

        return replyWithMetadata
    })

    return {
        question,
        replies: repliesW || [],
    }
}

export default handler
