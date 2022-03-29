/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */
import formatSlackMessage from '../../../util/formatSlackMessage'

const channels = async (req, res) => {
    const { token, channel } = JSON.parse(req.body)
    const client = new WebClient(token)

    try {
        const { messages } = await client.conversations.history({ channel })
        const formattedMessages = []
        for (const message of messages.filter((message) => message.subtype !== 'channel_join')) {
            const { ts, reply_count, client_msg_id } = message
            formattedMessages.push({
                ts,
                reply_count,
                client_msg_id,
                subject: '',
                slug: '',
                body: message?.blocks
                    ? await formatSlackMessage(message?.blocks[0]?.elements || [], token)
                    : message?.text,
            })
        }
        res.status(200).json(formattedMessages)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
}

export default channels
