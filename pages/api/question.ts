import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { definitions } from '../../@types/supabase'
import sendQuestionAlert from '../../util/sendQuestionAlert'
import getUserProfile from '../../util/getUserProfile'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { slug, subject, body, organizationId, token } = JSON.parse(req.body)

    if (!slug || !subject || !body || !organizationId || !token) {
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

    const { data: message, error: messageError } = await supabaseServerClient({ req, res })
        .from<Message>('squeak_messages')
        .insert({
            slug: [slug],
            profile_id: userProfile.id,
            subject,
            published: true,
            organization_id: organizationId,
        })
        .limit(1)
        .single()

    if (!message || messageError) {
        console.error(`[🧵 Question] Error creating message`)
        res.status(500)

        if (messageError) {
            console.error(`[🧵 Question] ${messageError.message}`)
            res.json({ error: messageError.message })
        }

        return
    }

    const { data: reply, error: replyError } = await supabaseServerClient({ req, res })
        .from<Reply>('squeak_replies')
        .insert({
            body,
            message_id: message.id,
            organization_id: organizationId,
            profile_id: userProfile.id,
        })
        .limit(1)
        .single()

    if (!reply || replyError) {
        console.error(`[🧵 Question] Error creating reply`)

        res.status(500)

        if (replyError) {
            console.error(`[🧵 Question] ${replyError.message}`)
            res.json({ error: replyError.message })
        }

        return
    }

    res.status(200).json({ messageId: message.id, profileId: userProfile.id, subject, body, slug: [slug] })

    sendQuestionAlert(organizationId, message.id, subject, body, slug, userProfile.id)
}

export default handler
