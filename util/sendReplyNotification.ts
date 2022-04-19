import { createClient } from '@supabase/supabase-js'
/* eslint-enable @typescript-eslint/no-var-requires */
import type { definitions } from '../@types/supabase'

/* eslint-disable @typescript-eslint/no-var-requires */
const Mailgun = require('mailgun.js')
const formData = require('form-data')
const { URL } = require('url')

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

const sendReplyNotification = async (organizationId: string, messageId: number, body: string) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: config, error: configError } = await supabaseServiceUserClient
        .from<Config>('squeak_config')
        .select(`mailgun_api_key, mailgun_domain, company_name, company_domain`)
        .eq('organization_id', organizationId)
        .limit(1)
        .single()

    if (!config || configError) {
        console.warn(`[⚙️ Config] Failed to fetch config for mailgun`)

        if (configError) {
            console.error(`[⚙️ Config] ${configError.message}`)
        }

        return
    }

    const { company_name, company_domain, mailgun_api_key, mailgun_domain } = config

    if (!company_name || !company_domain || !mailgun_api_key || !mailgun_domain) {
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

    const { data: userReadonlyProfile, error: userReadonlyProfileError } = await supabaseServiceUserClient
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .select(`user_id`)
        .eq('profile_id', message.profile_id)
        .eq('organization_id', organizationId)
        .limit(1)
        .single()

    if (!userReadonlyProfile || userReadonlyProfileError) {
        console.warn(`[📧 Mailgun] Profile not found for message`)

        if (userReadonlyProfileError) {
            console.error(`[📧 Mailgun] ${userReadonlyProfileError.message}`)
        }

        return
    }

    const { data: user, error: userError } = await supabaseServiceUserClient.auth.api.getUserById(
        userReadonlyProfile.user_id
    )

    if (!user || userError) {
        console.warn(`[📧 Mailgun] User not found for id ${message?.profile_id}`)

        if (userError) {
            console.error(`[📧 Mailgun] ${userError.message}`)
        }

        return
    }

    const { email } = user

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

    const url = new URL(company_domain)

    const mailgunData = {
        from: `${company_name} <noreply@${url.hostname}>`,
        to: email,
        subject: `Someone answered your question on ${company_domain}!`,
        text: `Hey,\n\nSomeone answered your question on ${company_domain}!\n\nQuestion:\n${message.subject}\n${question.body}\n\nReply:\n${body}\n\nThanks,\n\n${company_name}`,
    }

    await mg.messages.create(mailgun_domain, mailgunData)
}

export default sendReplyNotification
