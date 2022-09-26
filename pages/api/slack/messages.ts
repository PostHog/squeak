import type { UsersInfoResponse } from '@slack/web-api'
import type { ConversationsHistoryResponse } from '@slack/web-api/dist/response/ConversationsHistoryResponse'
import type { ConversationsRepliesResponse } from '@slack/web-api/dist/response/ConversationsRepliesResponse'
import { NextApiRequest, NextApiResponse } from 'next'
import xss from 'xss'
import { requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import formatSlackMessage from '../../../util/formatSlackMessage'

import { WebClient } from '@slack/web-api'

export interface Message {
    ts?: string
    reply_count: number
    client_msg_id: string | null
    subject: string
    slug: string
    body?: string
    user?: {
        first_name: string
        last_name: string
        avatar: string
        user_id: string
    }
    replies: Array<{
        ts?: string
        body?: string
        user?: {
            first_name: string
            last_name: string
            avatar: string
            user_id: string
        }
    }>
}

const messages = async (req: NextApiRequest, res: NextApiResponse<Array<Message> | { error: string }>) => {
    if (!(await requireOrgAdmin(req, res))) return
    const { token, organizationId, channel } = req.body

    if (!token || !organizationId || !channel) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const client = new WebClient(token)
    const { messages }: ConversationsHistoryResponse = await client.conversations.history({ channel, limit: 50 })

    const getUser = async (user: string | undefined) => {
        return (
            user &&
            client.users.info({ user }).then(({ user }: UsersInfoResponse) => {
                return {
                    first_name: user?.profile?.first_name,
                    last_name: user?.profile?.last_name,
                    avatar: user?.profile?.image_72,
                    user_id: user?.id,
                }
            })
        )
    }

    if (!messages) {
        res.status(200).json([])
        return
    }

    const formattedMessages: unknown[] = []
    for (const message of messages.filter((message) => message.subtype !== 'channel_join')) {
        const { ts, reply_count = 0, client_msg_id = null } = message

        const data = await prisma.question.findFirst({
            where: { slack_timestamp: ts },
            select: { slack_timestamp: true },
        })

        if (data || !ts) continue

        const replies =
            reply_count && reply_count >= 1
                ? await client.conversations
                      .replies({ ts, channel })
                      .then(({ messages: replies = [] }: ConversationsRepliesResponse) => replies)
                : null

        const formattedReplies: unknown[] = []

        if (replies) {
            for (const reply of replies) {
                const user = await getUser(reply?.user)
                formattedReplies.push({
                    ts: reply.ts,
                    body: formatSlackMessage(reply?.blocks?.[0]?.elements || []),
                    user,
                })
            }
        }

        formattedMessages.push({
            ts,
            reply_count: reply_count,
            client_msg_id: client_msg_id,
            subject: '',
            slug: '',
            body: message?.blocks
                ? formatSlackMessage(message?.blocks[0]?.elements || [])
                : xss(message?.text || '', {
                      whiteList: {},
                      stripIgnoreTag: true,
                  }),
            replies: formattedReplies,
            user: await getUser(message?.user),
        })
    }

    safeJson(res, formattedMessages)
}

export default messages
