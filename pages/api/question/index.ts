import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import xss from 'xss'

import { methodNotAllowed } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import checkAllowedOrigins from '../../../util/checkAllowedOrigins'
import getActiveOrganization from '../../../util/getActiveOrganization'
import getUserProfile from '../../../util/getUserProfile'
import sendQuestionAlert from '../../../util/sendQuestionAlert'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    switch (req.method) {
        case 'POST':
            return doPost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export interface CreateQuestionResponse {
    messageId: bigint
    profileId: string
    subject: string
    body: string
    slug: string[]
    published: boolean
}

export interface CreateQuestionRequestPayload {
    body: string
    slug: string
    subject: string
    token: string
    organizationId: string
}

// POST /api/question
// Endpoint used by sdk to allow end users to create questions
async function doPost(req: NextApiRequest, res: NextApiResponse) {
    const { slug, subject, token, body: rawBody, organizationId }: CreateQuestionRequestPayload = JSON.parse(req.body)

    if (!slug || !subject || !rawBody || !organizationId || !token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const body = xss(rawBody, {
        whiteList: {},
        stripIgnoreTag: true,
    })

    const { data: userProfile, error: userProfileError } = await getUserProfile({
        context: { req, res },
        organizationId,
        token,
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

    res.status(200).json(response)

    sendQuestionAlert(organizationId, message.id, subject, body, slug, userProfile.id)
}

export default handler
