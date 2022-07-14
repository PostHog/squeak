import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import xss from 'xss'
import { Prisma, Reply } from '@prisma/client'

import getUserProfile from '../../util/getUserProfile'
import sendReplyNotification from '../../util/sendReplyNotification'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'
import { createReply } from '../../db/reply'
import { methodNotAllowed } from '../../lib/api/apiUtils'

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
            return await handleCreate(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// POST /api/reply
// Public endpoint to create a reply
async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
    const { messageId, organizationId, token } = JSON.parse(req.body)

    if (!messageId || !JSON.parse(req.body).body || !organizationId || !token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const body = xss(JSON.parse(req.body).body, {
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

        return res.status(500)
    }

    try {
        const reply: Reply = await createReply(organizationId, body, messageId, userProfile)
        res.status(201).json(reply)
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
