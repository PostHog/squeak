/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import formatSlackMessage from '../../../util/formatSlackMessage'

const channels = async (req, res) => {
    const { token, channel } = JSON.parse(req.body)
    const client = new WebClient(token)
    const { messages } = await client.conversations.history({ channel })
    const formattedMessages = []
    for (const message of messages.filter((message) => message.subtype !== 'channel_join')) {
        const { ts, reply_count, client_msg_id } = message
        const { data } = await supabaseServerClient({ req, res })
            .from('squeak_messages')
            .select('slack_timestamp')
            .eq('slack_timestamp', ts)
            .single()
        if (data) continue
        const replies =
            (await reply_count) && reply_count >= 1
                ? await client.conversations.replies({ ts, channel }).then((data) =>
                      data.messages.map((message) => {
                          return {
                              ts: message.ts,
                              body: formatSlackMessage(message?.blocks[0]?.elements || [], token),
                          }
                      })
                  )
                : null
        formattedMessages.push({
            ts,
            reply_count: reply_count || null,
            client_msg_id: client_msg_id || null,
            subject: '',
            slug: '',
            body: message?.blocks ? formatSlackMessage(message?.blocks[0]?.elements || [], token) : message?.text,
            replies,
        })
    }
    res.status(200).json(formattedMessages)
}

export default channels
