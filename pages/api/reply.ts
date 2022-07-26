import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'
import xss from 'xss'
import { Prisma, Reply } from '@prisma/client'

import getUserProfile from '../../util/getUserProfile'
import sendReplyNotification from '../../util/sendReplyNotification'
import { createReply } from '../../db/reply'
import { allowedOrigin, corsMiddleware, validateBody } from '../../lib/middleware'
import { getSessionUser } from '../../lib/auth'
import { notAuthenticated, safeJson } from '../../lib/api/apiUtils'

const schema = {
    type: 'object',
    properties: {
        messageId: { type: 'number' },
        organizationId: { type: 'string' },
        body: { type: 'string' },
    },
    required: ['messageId', 'organizationId', 'body'],
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(validateBody(schema, { coerceTypes: true }), handleCreate)

// POST /api/reply
// Public endpoint to create a reply
async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
    const { messageId, organizationId, body: rawBody } = req.body

    const user = await getSessionUser(req)
    if (!user) return notAuthenticated(res)

    const body = xss(rawBody, {
        whiteList: {},
        stripIgnoreTag: true,
    })

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

        return res.status(500)
    }

    try {
        const reply: Reply = await createReply(organizationId, body, messageId, userProfile)
        safeJson(res, reply, 201)
        sendReplyNotification(organizationId, messageId, body)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(`[🧵 Reply] ${err.message}`)
            return res.status(500).json({ error: err.message })
        }
        return res.status(500).json({ error: err })
    }
}

export default handler
