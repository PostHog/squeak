import { definitions } from '../../@types/supabase'
import NextCors from 'nextjs-cors'
import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { slug, subject, body, token } = req.body

    if (!slug || !subject || !body || !token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const { user } = await supabaseServerClient({ req, res }).auth.api.getUser(token)

    if (!user) {
        console.error(`[🧵 Question] User not found for token`)
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    const { data: message, error: messageError } = await supabaseServerClient({ req, res })
        .from<Message>('squeak_messages')
        .insert({
            slug: [slug],
            subject,
            published: true,
        })
        .limit(1)
        .single()

    if (!message || messageError) {
        console.error(`[🧵 Question] Error creating message`)

        res.status(500)

        if (messageError) {
            console.error(`[🧵 Question] ${messageError}`)

            res.json({ error: messageError.message })
        }

        return
    }

    const { data: reply, error: replyError } = await supabaseServerClient({ req, res })
        .from<Reply>('squeak_replies')
        .insert({
            body,
            message_id: message.id,
            profile_id: user.id,
        })
        .limit(1)
        .single()

    if (!reply || replyError) {
        console.error(`[🧵 Question] Error creating reply`)

        res.status(500)

        if (replyError) {
            console.error(`[🧵 Question] ${replyError}`)

            res.json({ error: replyError.message })
        }

        return
    }

    res.status(200).json({ messageId: message.id, replyId: reply.id, subject, body, slug: [slug] })
}

export default handler
