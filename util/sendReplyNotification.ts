/* eslint-enable @typescript-eslint/no-var-requires */
import prisma from '../lib/db'

/* eslint-disable @typescript-eslint/no-var-requires */
const Mailgun = require('mailgun.js')
const formData = require('form-data')
const { URL } = require('url')

const sendReplyNotification = async (organizationId: string, messageId: number, body: string) => {
    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: {
            mailgun_api_key: true,
            mailgun_domain: true,
            mailgun_from_name: true,
            mailgun_from_email: true,
            company_name: true,
            company_domain: true,
        },
    })

    if (!config) {
        console.warn(`[⚙️ Config] Failed to fetch config for mailgun`)

        return
    }

    const { company_name, company_domain, mailgun_api_key, mailgun_domain, mailgun_from_name, mailgun_from_email } =
        config

    if (!company_name || !company_domain || !mailgun_api_key || !mailgun_domain) {
        console.warn(`[📧 Mailgun] Mailgun credentials missing in config`)
        return
    }

    const message = await prisma.question.findUnique({
        where: { id: messageId },
        select: { subject: true, profile_id: true, slug: true },
    })

    if (!message) {
        console.warn(`[📧 Mailgun] Message not found for id ${messageId}`)

        return
    }

    if (!message?.profile_id) {
        console.warn(`[📧 Mailgun] Message ID ${messageId} has no profile ID`)
        return
    }

    const userReadonlyProfile = await prisma.profileReadonly.findFirst({
        where: { organization_id: organizationId, profile_id: message.profile_id },
        select: { user_id: true },
    })

    if (!userReadonlyProfile || !userReadonlyProfile.user_id) {
        console.warn(`[📧 Mailgun] Profile not found for message`)

        return
    }

    const user = await prisma.user.findUnique({
        where: { id: userReadonlyProfile.user_id },
    })

    if (!user) {
        console.warn(`[📧 Mailgun] User not found for id ${message?.profile_id}`)

        return
    }

    const { email } = user

    if (!email) {
        console.warn(`[📧 Mailgun] Profile ID ${message?.profile_id} has no email`)
        return
    }

    const question = await prisma.reply.findFirst({
        where: { message_id: messageId },
        select: { body: true },
        orderBy: { created_at: 'asc' },
    })

    if (!question) {
        console.warn(`[📧 Mailgun] Question not found for id ${messageId}`)

        return
    }

    const mailgun = new Mailgun(formData)

    const mg = mailgun.client({
        username: 'api',
        key: mailgun_api_key,
    })

    const url = new URL(company_domain)

    const mailgunData = {
        from: `${mailgun_from_name || company_name} <${mailgun_from_email || `noreply@${url.hostname}`}>`,
        to: email,
        subject: `Someone answered your question on ${company_domain}!`,
        html: `Hey,<br>Someone answered your question on <a href="${url.origin}${message.slug}">${url.origin}${message.slug}</a>!<br><br>Question:<br>${message.subject}<br>${question.body}<br><br>Reply:<br>${body}<br>Thanks,<br>${company_name}`,
    }

    await mg.messages.create(mailgun_domain, mailgunData)
}

export default sendReplyNotification
