import type { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

import getUserProfile from '../../../util/getUserProfile'
import prisma from '../../../lib/db'
import { corsMiddleware, allowedOrigin, validateBody } from '../../../lib/middleware'
import { notAuthenticated, safeJson } from '../../../lib/api/apiUtils'
import { getSessionUser } from '../../../lib/auth'

const schema = {
    type: 'object',
    properties: {
        messageId: { type: 'number' },
        replyId: { type: 'number', nullable: true },
        organizationId: { type: 'string' },
        resolved: { type: 'boolean' },
    },
    required: ['messageId', 'organizationId', 'resolved'],
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(validateBody(schema, { coerceTypes: true }), doResolve)

// POST /api/question/resolve
// Public API to resolve a question
async function doResolve(req: NextApiRequest, res: NextApiResponse) {
    const { messageId, replyId, organizationId, resolved } = req.body

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

    // Find the message, ensure it exists
    let message = await prisma.question.findFirst({
        where: { id: messageId, organization_id: organizationId },
    })

    if (!message) {
        res.status(404).json({ error: 'Message not found' })
        return
    }

    try {
        message = await prisma.question.update({
            where: { id: message.id },
            data: {
                resolved,
                resolved_reply_id: replyId || null,
            },
        })

        safeJson(res, {
            messageId: message.id,
            resolved: message.resolved,
            resolved_reply_id: message.resolved_reply_id,
        })
    } catch (err) {
        console.error(`[🧵 Question] Error updating message`)
        return res.status(500).json({ error: err })
    }
}

export default handler
