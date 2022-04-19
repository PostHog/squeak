import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import xss from 'xss'
import { definitions } from '../../@types/supabase'
import getUserProfile from '../../util/getUserProfile'
import sendReplyNotification from '../../util/sendReplyNotification'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'

type Config = definitions['squeak_config']
type Reply = definitions['squeak_replies']

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
            console.error(`[🧵 Question] ${userProfileError.message}`)
            res.json({ error: userProfileError.message })
        }

        return
    }

    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: config, error: configError } = await supabaseServiceRoleClient
        .from<Config>('squeak_config')
        .select('reply_auto_publish')
        .eq('organization_id', organizationId)
        .limit(1)
        .single()

    if (!config || configError) {
        console.error(`[🧵 Reply] Error fetching config`)
        res.status(500)

        if (configError) {
            console.error(`[🧵 Reply] ${configError.message}`)
            res.json({ error: configError.message })
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
            published: config.reply_auto_publish,
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
