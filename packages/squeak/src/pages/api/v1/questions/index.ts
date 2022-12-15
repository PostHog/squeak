import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'

import { safeJson } from '../../../../lib/api/apiUtils'
import NextCors from 'nextjs-cors'
import prisma from 'src/lib/db'
import checkAllowedOrigins from 'src/util/checkAllowedOrigins'

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'OPTIONS'],
        origin: '*',
        optionsSuccessStatus: 200,
        credentials: true,
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    const {
        organizationId,
        start = '0',
        perPage = '20',
        published,
        slug,
        topic,
        profileId,
        sortBy = 'newest', // 'newest' |  'activity' | 'popular'
        permalink,
    } = req.query as Record<string, string>

    const queryConditions: Prisma.QuestionWhereInput = {
        organization_id: organizationId,
    }

    const orderBy: Prisma.QuestionOrderByWithRelationInput = {}

    if (permalink) {
        queryConditions.permalink = permalink
    } else {
        if (published) queryConditions.published = published === 'true'
        if (slug) queryConditions.slug = { has: slug }
        if (profileId)
            queryConditions.replies = {
                some: {
                    profile_id: profileId,
                },
            }
        if (topic) {
            queryConditions.topics = {
                some: {
                    topic_id: BigInt(topic),
                },
            }
        }

        if (sortBy === 'newest') {
            orderBy.created_at = 'desc'
        } else if (sortBy === 'popular') {
            orderBy.replies = {
                _count: 'desc',
            }
        } else if (sortBy === 'activity') {
            const latestQuestions: { id: bigint }[] = await prisma.$queryRaw`
            SELECT id FROM squeak_messages LEFT JOIN (
                SELECT message_id, max(created_at) AS latest_reply_ts FROM squeak_replies GROUP BY message_id
            ) AS latest_replies
            ON "squeak_messages".id = latest_replies.message_id
            WHERE (
                "public"."squeak_messages"."organization_id"::text = ${organizationId} AND "public"."squeak_messages"."published" = ${
                published === 'true'
            }
            )
            ORDER BY latest_reply_ts DESC
            OFFSET ${BigInt(start)}
            LIMIT ${BigInt(perPage)}
        `

            const messages = await prisma.question.findMany({
                where: {
                    id: {
                        in: latestQuestions.map((q) => q.id),
                    },
                },
                include: {
                    _count: {
                        select: {
                            replies: true,
                        },
                    },
                    replies: {
                        include: {
                            profile: true,
                        },
                        orderBy: { created_at: 'asc' },
                    },
                    topics: {
                        include: {
                            topic: true,
                        },
                    },
                },
            })

            const orderMap = latestQuestions.reduce((acc, q, i) => {
                acc[q.id.toString()] = i
                return acc
            }, {})

            let sortedMessages = messages.sort((a, b) => {
                return orderMap[a.id.toString()] - orderMap[b.id.toString()]
            })

            const data = {
                questions: sortedMessages.map((message) => {
                    const { _count, ...question } = message
                    const profile = message.replies?.[0]?.profile

                    return {
                        ...question,
                        profile,
                        numReplies: _count.replies,
                    }
                }),
                count: messages.length,
            }

            safeJson(res, data)
            return
        }
    }

    const messages = await prisma.question.findMany({
        where: queryConditions,
        include: {
            _count: {
                select: {
                    replies: true,
                },
            },
            replies: {
                include: {
                    profile: true,
                },
                orderBy: { created_at: 'asc' },
            },
            topics: {
                include: {
                    topic: true,
                },
            },
        },
        orderBy,
        skip: parseInt(start), // offset
        take: parseInt(perPage), // limit
    })

    const data = {
        questions: messages.map((message) => {
            const { _count, ...question } = message
            const profile = message.replies?.[0]?.profile

            return {
                ...question,
                profile,
                numReplies: _count.replies,
            }
        }),
        count: messages.length,
    }

    safeJson(res, data)
}

export default handler
