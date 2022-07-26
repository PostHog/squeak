import { JSONSchemaType } from 'ajv'
import { NextApiRequest, NextApiResponse } from 'next'
import xss from 'xss'

import nc from '../../../lib/next-connect'
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

const handler = nc
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(validateBody(schema, { coerceTypes: true }), doPost)

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
        context: { req, res },
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

    // Create the question in the database
    const message = await prisma.question.create({
        data: {
            slug: [slug],
            profile_id: userProfile.id,
            subject,
            published: config.question_auto_publish,
            organization_id: organizationId,
        },
    })

    if (!message) {
        console.error(`[🧵 Question] Error creating message`)
        res.status(500).json({ error: 'Error creating message' })

        return
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
    sendQuestionAlert(organizationId, message.id, subject, body, slug, userProfile.id)
}

export default handler
