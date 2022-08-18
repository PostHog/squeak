import { SqueakConfig, User } from '@prisma/client'
import prisma from '../db'
import getClient from './client'
import { confirmation, EmailTemplateOptions, resetPassword, userInvite } from './templates'

interface SqueakEmailConfig {
    mailgun_from_name: string | null
    mailgun_from_email: string | null
    company_name: string | null
    mailgun_api_key: string
    mailgun_domain: string
    company_domain: string
}

export async function sendUserConfirmation(organizationId: string, user: Pick<User, 'email'>, url: string) {
    if (!user.email) throw new Error('user email is null')
    return sendEmail(organizationId, user.email, confirmation(url))
}

export async function sendUserInvite(organizationId: string, user: User, confirmationUrl: string) {
    const config = await fetchConfig(organizationId)
    if (!config) throw new Error('Squeak config not found for organization')
    const emailConfig = checkValidMailgunConfig(config)
    if (!user.email) throw new Error('user email is null')

    return sendEmail(organizationId, user.email, userInvite(confirmationUrl, emailConfig.company_domain))
}

const defaultEmailConfig: ValidEmailConfig = {
    mailgun_api_key: process.env.MAILGUN_API_KEY as string,
    mailgun_domain: 'mail.squeak.cloud',
    mailgun_from_email: 'noreply@squeak.cloud',
    mailgun_from_name: 'PostHog',
    company_domain: 'https://squeak.cloud',
    company_name: 'Squeak',
}

export async function sendForgotPassword(user: User, url: string, organizationId?: string) {
    if (!user.email) throw new Error('user email is null')

    const config = organizationId ? await fetchConfig(organizationId) : defaultEmailConfig

    const emailConfig = checkValidMailgunConfig(config)
    const client = await getClient(emailConfig.mailgun_api_key)

    const template = resetPassword(url)
    const mailgunOptions = mailgunSendOptions(template, emailConfig)

    return client.messages.create(
        emailConfig.mailgun_domain,
        Object.assign(mailgunOptions, {
            to: user.email,
        })
    )
}

export async function sendEmail(organizationId: string, to: string, template: EmailTemplateOptions) {
    const config = await fetchConfig(organizationId)
    if (!config) throw new Error('Squeak config not found for organization')

    const emailConfig = checkValidMailgunConfig(config)
    const client = await getClient(emailConfig.mailgun_api_key)

    const mailgunOptions = mailgunSendOptions(template, emailConfig)

    return client.messages.create(
        emailConfig.mailgun_domain,
        Object.assign(mailgunOptions, {
            to,
        })
    )
}

function formatCompanyDomain(domain: string) {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
        return domain
    }

    return `https://${domain}`
}

function mailgunSendOptions(templateOptions: EmailTemplateOptions, config: SqueakEmailConfig) {
    const url = new URL(formatCompanyDomain(config.company_domain))

    const fromName = config.mailgun_from_name || config.company_name
    const fromDomain = config.mailgun_from_email || `noreply@${url.hostname}`

    return Object.assign(
        {
            from: `${fromName} <${fromDomain}>`,
        },
        templateOptions
    )
}

type ValidEmailConfig = Pick<
    SqueakConfig,
    | 'mailgun_api_key'
    | 'mailgun_domain'
    | 'company_domain'
    | 'mailgun_from_email'
    | 'mailgun_from_name'
    | 'company_name'
>

function checkValidMailgunConfig(config: ValidEmailConfig | null): SqueakEmailConfig {
    if (!config) throw new Error('no email config is present')
    if (!config.mailgun_api_key) throw new Error('mailgun_api_key is not configured')
    if (!config.mailgun_domain) throw new Error('mailgun_domain is not configured')
    if (!config.company_domain) throw new Error('company_domain is not configured')

    return Object.assign(config)
}

function fetchConfig(organizationId: string) {
    return prisma.squeakConfig.findFirst({
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
}
