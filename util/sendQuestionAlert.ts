import { createClient } from '@supabase/supabase-js'

const sendReplyNotification = async (
    messageId: number,
    subject: string,
    body: string,
    slug: string,
    userId: string
) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: webhooks, error } = await supabaseServiceUserClient
        .from('squeak_webhook_notifications')
        .select('url, type, id')
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
                        .from('squeak_profiles')
                        .select('first_name')
                        .match({ id: userId })
                        .single()
                        .then(({ data: { first_name } }) => {
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
                                            type: 'section',
                                            text: {
                                                type: 'mrkdwn',
                                                text: body,
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

export default sendReplyNotification
