import { createClient } from '@supabase/supabase-js'

/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */

import type { definitions } from '../@types/supabase'

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']

const sendReplyNotification = async (messageId: number, subject: string, body: string, slug: string) => {
    const supabaseServiceUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: config, error: configError } = await supabaseServiceUserClient
        .from<Config>('squeak_config')
        .select(`slack_api_key, slack_question_channel`)
        .eq('id', 1)
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

    let result
    try {
        result = await client.chat.postMessage({
            channel: slack_question_channel,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `New question on ${slug}:\n\n*Subject*\n\n${subject}\n\n*Question*\n\n${body}`,
                    },
                },
                // {
                //     type: 'actions',
                //     elements: [
                //         {
                //             type: 'button',
                //             url: 'https://posthog.com',
                //             text: {
                //                 type: 'plain_text',
                //                 text: 'View Question',
                //                 emoji: true,
                //             },
                //         },
                //     ],
                // },
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
