import { definitions } from '../../@types/supabase'
import NextCors from 'nextjs-cors'
import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import sendReplyNotification from '../../util/sendReplyNotification'

type Reply = definitions['squeak_replies']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { messageId, body: answerBody, domain, token } = req.body

    const { user } = await supabaseServerClient({ req, res }).auth.api.getUser(token)

    if (!user) {
        console.error(`[🧵 Reply] User not found for token`)
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    const { data, error } = await supabaseServerClient({ req, res }).from<Reply>('squeak_replies').insert({
        body: answerBody,
        message_id: messageId,
        profile_id: user?.id,
    })

    if (error) {
        console.error(`[🧵 Reply] ${error.message}`)
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json({ ...data })

    sendReplyNotification(messageId, answerBody, domain)
}

export default handler
