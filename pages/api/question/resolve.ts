import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import getUserProfile from '../../../util/getUserProfile'
import checkAllowedOrigins from '../../../util/checkAllowedOrigins'
import prisma from '../../../lib/db'

// POST /api/question/resolve
// Public API to resolve a question
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

    const { token, messageId, replyId, organizationId, resolved } = JSON.parse(req.body)

    if (!messageId || !token || !organizationId) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

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

        res.status(200).json({
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
