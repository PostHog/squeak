import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { definitions } from '../../@types/supabase'
import sendReplyNotification from '../../util/sendReplyNotification'
import getUserProfile from '../../util/getUserProfile'
import { createClient } from '@supabase/supabase-js'

type Reply = definitions['squeak_replies']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { messageId, body, organizationId, token } = JSON.parse(req.body)

    if (!messageId || !body || !organizationId || !token) {
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

    const { data, error } = await supabaseServiceRoleClient
        .from<Reply>('squeak_replies')
        .insert({
            body: body,
            message_id: messageId,
            organization_id: organizationId,
            profile_id: userProfile.id,
        })
        .limit(1)
        .single()

    if (error) {
        console.error(`[🧵 Reply] ${error.message}`)
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json({ ...data })

    sendReplyNotification(organizationId, messageId, body)
}

export default handler
