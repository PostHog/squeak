import { NextApiRequest, NextApiResponse } from 'next'

import { findOrCreateProfileFromSlackUser } from '../../../db/'
import { requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import nextConnect from 'next-connect'
import { Message as MessageResponse } from './messages'

const handler = nextConnect<NextApiRequest, NextApiResponse>().post(handlePost)

interface ImportBodyPayload {
    question: Partial<MessageResponse>
    organizationId: string
    message: {
        slack_timestamp: string
        created_at: string
        subject: string
        slug: string[]
        published: boolean
        organization_id: string
    }
}

// POST /api/slack/import
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const {
        message: messageAttrs,
        organizationId,
        question: { reply_count, replies, body, ts, user },
    }: ImportBodyPayload = req.body

    // Create a question for the original slack message
    const message = await prisma.question.create({
        data: messageAttrs,
    })

    // Create replies for replies to the slack message
    if (reply_count && reply_count >= 1 && replies) {
        await Promise.all(
            replies.map(({ body, ts, user }) => {
                return insertReply({
                    organizationId,
                    body: body || '',
                    id: Number(message.id),
                    created_at: ts ? new Date(parseInt(ts) * 1000) : null,
                    user,
                })
            })
        )
    } else {
        await insertReply({
            organizationId,
            body: body ?? '',
            id: Number(message.id),
            created_at: ts ? new Date(parseInt(ts) * 1000) : null,
            user,
        })
    }

    safeJson(res, message, 201)
}

async function insertReply({
    organizationId,
    body,
    id,
    created_at,
    user,
}: {
    organizationId: string
    body: string
    id: number
    created_at: Date | null
    user?: {
        first_name: string
        last_name: string
        avatar: string
        user_id: string
    }
}) {
    const profileId = await findOrCreateProfileFromSlackUser({
        first_name: user?.first_name,
        last_name: user?.last_name,
        avatar: user?.avatar,
        organization_id: organizationId,
        slack_user_id: user?.user_id,
    })

    await prisma.reply.create({
        data: {
            created_at: created_at ? created_at.toISOString() : '',
            body,
            message_id: id,
            organization_id: organizationId,
            profile_id: profileId,
            published: true,
        },
    })
}

export default handler
