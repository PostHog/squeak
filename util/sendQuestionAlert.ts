import { createClient } from '@supabase/supabase-js'
import type { definitions } from '../@types/supabase'

/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']
type Profile = definitions['squeak_profiles']

const sendReplyNotification = async (
    organizationId: number,
    messageId: number,
    subject: string,
    body: string,
    slug: string,
    profileId: number
) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: config, error: configError } = await supabaseServiceUserClient
        .from<Config>('squeak_config')
        .select(`slack_api_key, slack_question_channel`)
        .eq('organisation_id', organizationId)
        .single()

    if (!config || configError) {
        console.warn(`[⚙️ Config] Failed to fetch config for slack`)

        if (configError) {
            console.error(`[⚙️ Config] ${configError.message}`)
        }

        return
    }

    const { slack_api_key, slack_question_channel } = config

    if (!slack_api_key || !slack_question_channel) {
        console.warn(`[📧 Slack] Slack credentials missing in config`)
        return
    }

    const client = new WebClient(slack_api_key)

    const { data: profile, error: profileError } = await supabaseServiceUserClient
        .from<Profile>('squeak_profiles')
        .select(`first_name, avatar`)
        .eq('id', profileId)
        .single()

    if (!profile || profileError) {
        console.warn(`[⚙️ Profiles] Failed to fetch profile`)

        if (profileError) {
            console.error(`[⚙️ Profiles] ${profileError.message}`)
        }

        return
    }

    const { first_name, avatar } = profile

    let result
    try {
        result = await client.chat.postMessage({
            channel: slack_question_channel,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `${first_name} on ${slug}`,
                        emoji: true,
                    },
                    block_id: 'name_and_slug',
                },
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: subject,
                        emoji: true,
                    },
                    block_id: 'subject',
                },
                {
                    type: 'section',
                    block_id: 'question',
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
            ],
        })
    } catch (error) {
        console.error(error)
        return
    }

    if (!result) {
        return
    }

    const { data: message, error: messageError } = await supabaseServiceUserClient
        .from<Message>('squeak_messages')
        .update({
            slack_timestamp: result.ts,
        })
        .match({ id: messageId })

    if (!message || messageError) {
        console.warn(`[📧 Slack] Failed to update message with slack timestamp`)

        if (messageError) {
            console.error(`[📧 Slack] ${messageError.message}`)
        }
    }
}

export default sendReplyNotification
