import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import xss from 'xss'
import { definitions } from '../../@types/supabase'
import getUserProfile from '../../util/getUserProfile'
import sendQuestionAlert from '../../util/sendQuestionAlert'

type Message = definitions['squeak_messages']
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

    const { slug, subject, organizationId, token } = JSON.parse(req.body)

    if (!slug || !subject || !req.body.body || !organizationId || !token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const body = xss(req.body.body, {
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
            console.error(`[🧵 Question] ${userProfileError.message}`)
            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: message, error: messageError } = await supabaseServiceRoleClient
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

    const { data: reply, error: replyError } = await supabaseServiceRoleClient
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
