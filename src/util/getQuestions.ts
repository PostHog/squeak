import { Prisma, Question, Reply } from '@prisma/client'
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
    slug?: string
    start?: number
    perPage?: number
    topic?: string
}

interface GetQuestionsPayload {
    data: {
        questions: {
            question: Question
            replies: Reply[]
        }[]
        count: number
    }
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
    const { organizationId, start = 0, perPage = 20, published, slug, topic } = params
    // const end = start + (perPage - 1)

    const queryConditions: Prisma.QuestionWhereInput = {
        organization_id: organizationId,
    }

    if (published) queryConditions.published = published
    if (slug && slug !== '') queryConditions.slug = { has: slug }
    if (topic) queryConditions.topics = { has: topic }

    const messages = await prisma.question.findMany({
        where: queryConditions,
        include: {
            replies: {
                orderBy: { created_at: 'asc' },
                include: {
                    profile: {
                        include: {
                            profiles_readonly: {
                                where: { organization_id: organizationId },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
        skip: start, // offset
        take: perPage, // limit
    })

    const count: number = await prisma.question.count({
        where: queryConditions,
    })

    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: { show_slack_user_profiles: true },
    })

    const show_slack_user_profiles = config?.show_slack_user_profiles

    return {
        data: {
            questions: (messages || []).map((message) => {
                let replies = message.replies || []

                // if we're not showing slack user profiles, filter them out in reply profiles
                if (!show_slack_user_profiles) {
                    replies = message.replies.map((reply) => {
                        return reply.profile?.profiles_readonly?.[0]?.slack_user_id
                            ? { ...reply, profile: null }
                            : reply
                    })
                }

                return { question: message, replies }
            }),
            count: count ?? 0,
        },
    }
}

export default getQuestions
