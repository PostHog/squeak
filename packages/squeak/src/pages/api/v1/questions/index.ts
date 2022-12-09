import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma, PrismaClient } from '@prisma/client'

import { safeJson } from '../../../../lib/api/apiUtils'
import nextConnect from 'next-connect'
import { corsMiddleware, allowedOrigin } from '../../../../lib/middleware'

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .get(fetchQuestions)

const prisma = new PrismaClient()

async function fetchQuestions(req: NextApiRequest, res: NextApiResponse) {
    const {
        organizationId,
        start = '0',
        perPage = '20',
        published,
        slug,
        topic,
        profileId,
        sortBy = 'newest', // 'newest' | 'popular'
    } = req.query as Record<string, string>

    const queryConditions: Prisma.QuestionWhereInput = {
        organization_id: organizationId,
    }

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

    const orderBy: Prisma.QuestionOrderByWithRelationInput = {}

    if (sortBy === 'newest') orderBy.created_at = 'desc'
    if (sortBy === 'popular')
        orderBy.replies = {
            _count: 'desc',
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
