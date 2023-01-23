import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { allowedOrigin, corsMiddleware } from 'src/lib/middleware'
import prisma from 'src/lib/db'
import { safeJson } from 'src/lib/api/apiUtils'

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .get(getLeaderboard)

async function getLeaderboard(req, res) {
    const { organizationId } = req.query

    if (!organizationId) return res.status(403)

    const data = await prisma.profile.findMany({
        where: {
            organization_id: organizationId,
            role: {
                not: 'admin',
            },
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar: true,
            replies: {
                select: {
                    _count: true,
                },
            },
            squeak_messages: {
                select: {
                    id: true,
                },
            },
        },
        orderBy: {
            replies: {
                _count: 'desc',
            },
        },
        take: 10,
    })

    const topProfileStats = data
        .map(({ replies, squeak_messages, ...other }) => {
            return {
                ...other,
                replies: replies.length - squeak_messages.length,
                resolutions: replies.reduce(
                    (prev, curr) => {
                        return {
                            _count: {
                                squeak_messages_squeak_messages_resolved_reply_idTosqueak_replies:
                                    prev._count.squeak_messages_squeak_messages_resolved_reply_idTosqueak_replies +
                                    curr._count.squeak_messages_squeak_messages_resolved_reply_idTosqueak_replies,
                            },
                        }
                    },
                    { _count: { squeak_messages_squeak_messages_resolved_reply_idTosqueak_replies: 0 } }
                )?._count?.squeak_messages_squeak_messages_resolved_reply_idTosqueak_replies,
            }
        })
        .sort((a, b) => (a.replies > b.replies ? -1 : 1))

    safeJson(res, topProfileStats)
}

export default handler
