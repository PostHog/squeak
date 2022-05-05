import { createClient } from '@supabase/supabase-js'
import { definitions } from '../@types/supabase'

type WebhookConfig = definitions['squeak_webhook_config']

const sendQuestionAlert = async (
    organizationId: string,
    messageId: number,
    subject: string,
    body: string,
    slug: string,
    profileId: string
) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: webhooks, error } = await supabaseServiceUserClient
        .from<WebhookConfig>('squeak_webhook_config')
        .select('url, type, id')
        .eq('organization_id', organizationId)

    if (error) {
        console.warn(`[⚙️ Config] Failed to fetch webhooks`)
        return
    }

    Promise.all(
        webhooks.map(({ url, type }) => {
            switch (type) {
                case 'webhook':
                    return fetch(url, { method: 'POST', body: JSON.stringify({ subject, slug, body }) })
                case 'slack':
                    return supabaseServiceUserClient
                        .from('squeak_profiles_view')
                        .select('first_name, avatar')
                        .eq('profile_id', profileId)
                        .eq('organization_id', organizationId)
                        .limit(1)
                        .single()
                        .then(({ data: { first_name, avatar } }) => {
                            return fetch(url, {
                                method: 'POST',
                                body: JSON.stringify({
                                    text: `Question asked on ${slug[0]}`,
                                    blocks: [
                                        {
                                            type: 'header',
                                            text: {
                                                type: 'plain_text',
                                                text: `${first_name} on ${slug}`,
                                                emoji: true,
                                            },
                                        },
                                        {
                                            type: 'header',
                                            text: {
                                                type: 'plain_text',
                                                text: subject,
                                                emoji: true,
                                            },
                                        },
                                        {
                                            type: 'section',
                                            text: {
                                                type: 'mrkdwn',
                                                text: body,
                                            },
                                            ...(avatar && {
                                                accessory: {
                                                    type: 'image',
                                                    image_url: avatar,
                                                    alt_text: first_name,
                                                },
                                            }),
                                        },
                                        {
                                            type: 'section',
                                            text: {
                                                type: 'mrkdwn',
                                                text: `<https://squeak.cloud/question/${messageId}|View question>`,
                                            },
                                        },
                                    ],
                                }),
                            })
                        })
            }
        })
    )
}

export default sendQuestionAlert
