import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import NextCors from 'nextjs-cors'
import getUserProfile from '../../../util/getUserProfile'
import { definitions } from '../../../@types/supabase'

type Message = definitions['squeak_messages']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { token, messageId, replyId, organizationId } = JSON.parse(req.body)

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
            console.error(`[🧵 Question] ${userProfileError.message}`)
            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: message, error: messageError } = await supabaseServiceRoleClient
        .from<Message>('squeak_messages')
        .update({
            resolved: true,
            resolved_reply_id: replyId || null,
        })
        .match({ id: messageId, organization_id: organizationId })
        .limit(1)
        .single()

    if (!message || messageError) {
        console.error(`[🧵 Question] Error resolving message`)
        res.status(500)

        if (messageError) {
            console.error(`[🧵 Question] ${messageError.message}`)
            res.json({ error: messageError.message })
        }

        return
    }

    res.status(200).json({
        messageId: message.id,
        resolved: message.resolved,
        resolved_reply_id: message.resolved_reply_id,
    })
}

export default handler
