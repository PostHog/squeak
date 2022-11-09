import { Prisma, Profile, Question } from '@prisma/client'
import { GetServerSidePropsContext, NextApiRequest } from 'next'
import prisma from '../lib/db'

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
      }

export interface GetQuestionsParams {
    organizationId: string
    published?: boolean
    profileId?: string
    slug?: string
    start?: number
    perPage?: number
    topic?: string
}

interface GetQuestionsPayload {
    data: {
        questions: {
            question: Question
            profile: Profile | null
            numReplies: number
        }[]
        count: number
    }
    totalCount: number
}

/**
 * This needs to:
 *   1. Get questions
 *   2. Eager-load replies for all the returned questions
 *   3. Filter out profiles of repliers if we're not showing slack profiles
 * @param context
 * @param params
 * @returns
 */
const getQuestions = async (context: Context, params: GetQuestionsParams): Promise<GetQuestionsPayload> => {
    const { organizationId, start = 0, perPage = 20, published, slug, topic, profileId } = params

    const queryConditions: Prisma.QuestionWhereInput = {
        organization_id: organizationId,
    }

    if (published) queryConditions.published = published
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
        },
        orderBy: {
            created_at: 'desc',
        },
        skip: start, // offset
        take: perPage, // limit
    })

    const totalCount = await prisma.question.count({
        where: queryConditions,
    })

    // const show_slack_user_profiles = config?.show_slack_user_profiles

    return {
        data: {
            questions: (messages || []).map((message) => {
                const profile = message.replies?.[0]?.profile

                return {
                    question: message,
                    profile,
                    numReplies: message._count.replies,
                }
            }),
            count: messages.length ?? 0,
        },
        totalCount,
    }
}

export default getQuestions
