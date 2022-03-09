import { createClient } from '@supabase/supabase-js'

/* eslint-disable @typescript-eslint/no-var-requires */
const Mailgun = require('mailgun.js')
const formData = require('form-data')
/* eslint-enable @typescript-eslint/no-var-requires */

import type { definitions } from '../@types/supabase'

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

const sendReplyNotification = async (messageId: number, answerBody: string, domain: string) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: config, error: configError } = await supabaseServiceUserClient
        .from<Config>('squeak_config')
        .select(`mailgun_api_key, mailgun_domain`)
        .eq('id', 1)
        .single()

    if (!config || configError) {
        console.warn(`[⚙️ Config] Failed to fetch config for mailgun`)

        if (configError) {
            console.error(`[⚙️ Config] ${configError.message}`)
        }

        return
    }

    const { mailgun_api_key, mailgun_domain } = config ?? {}

    if (!mailgun_api_key || !mailgun_domain) {
        console.warn(`[📧 Mailgun] Mailgun credentials missing in config`)
        return
    }

    const { data: message, error: messageError } = await supabaseServiceUserClient
        .from<Message>('squeak_messages')
        .select(`subject, profile_id`)
        .eq('id', messageId)
        .single()

    if (!message || messageError) {
        console.warn(`[📧 Mailgun] Message not found for id ${messageId}`)

        if (messageError) {
            console.error(`[📧 Mailgun] ${messageError.message}`)
        }

        return
    }

    if (!message?.profile_id) {
        console.warn(`[📧 Mailgun] Message ID ${messageId} has no profile ID`)
        return
    }

    const { data: user, error: userError } = await supabaseServiceUserClient.auth.api.getUserById(message?.profile_id)

    if (!user || userError) {
        console.warn(`[📧 Mailgun] User not found for id ${message?.profile_id}`)

        if (userError) {
            console.error(`[📧 Mailgun] ${userError.message}`)
        }

        return
    }

    const { email } = user ?? {}

    if (!email) {
        console.warn(`[📧 Mailgun] Profile ID ${message?.profile_id} has no email`)
        return
    }

    const { data: question, error: questionError } = await supabaseServiceUserClient
        .from<Reply>('squeak_replies')
        .select(`body`)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (!question || questionError) {
        console.warn(`[📧 Mailgun] Question not found for id ${messageId}`)

        if (questionError) {
            console.error(`[📧 Mailgun] ${questionError.message}`)
        }

        return
    }

    const mailgun = new Mailgun(formData)

    const mg = mailgun.client({
        username: 'api',
        key: mailgun_api_key,
    })

    const mailgunData = {
        from: `Squeak <noreply@${domain}>`,
        to: email,
        subject: `Someone answered your question on ${domain}!`,
        text: `Hey,\n\nSomeone answered your question on ${domain}!\n\nQuestion:\n${question.body}\n\nReply:\n${answerBody}\n\nThanks,\n\nSqueak`,
    }

    await mg.messages.create(mailgun_domain, mailgunData)
}

export default sendReplyNotification