import { Prisma, Question } from '@prisma/client'
import slugify from 'slugify'

import prisma from '../lib/db'
import { UpdateQuestionRequestPayload } from '../pages/api/question/[id]'
import { updateRepliesPublished } from './reply'

export type UpdateQuestionParams = Prisma.XOR<Prisma.QuestionUpdateInput, Prisma.QuestionUncheckedUpdateInput> & {
    replyId?: number
}

export async function getQuestion(id: number, params: { fields?: string } = {}) {
    const { fields } = params
    const select: { [key: string]: boolean } = {}

    if (fields && fields !== '') {
        fields.split(',').forEach((field: string) => {
            select[field] = true
        })
    }

    let question: Question | Partial<Question> | null = null

    if (fields && fields.length > 0) {
        question = await prisma.question.findUnique({
            where: { id },
            select,
        })
    } else {
        question = await prisma.question.findUnique({
            where: { id },
            select: {
                subject: true,
                id: true,
                slug: true,
                created_at: true,
                published: true,
                slack_timestamp: true,
                resolved: true,
                resolved_reply_id: true,
                replies: {
                    orderBy: { created_at: 'asc' },
                    select: {
                        id: true,
                        body: true,
                        created_at: true,
                        published: true,
                        profile: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                avatar: true,
                                profiles_readonly: {
                                    select: {
                                        role: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
    }

    return question
}

export async function updateQuestion(
    id: number,
    organizationId: string,
    params: UpdateQuestionRequestPayload
): Promise<Question> {
    const { replyId, ...rest } = params
    let permalink = params.permalink

    if (permalink && permalink !== '') {
        permalink = slugify(permalink, {
            lower: true,
        })

        // Check if another question has the same permalink
        const existing = await prisma.question.findFirst({
            where: { permalink, organization_id: organizationId, id: { not: id } },
            select: { permalink: true },
        })

        if (existing?.permalink && existing.permalink !== '') {
            throw new Error('Permalink already exists')
        }
    }

    if (rest.published !== undefined && replyId) {
        await updateRepliesPublished(replyId, rest.published)
    }

    return prisma.question.update({
        where: { id },
        data: { ...rest, permalink },
    })
}

export async function deleteQuestion(id: number): Promise<Question> {
    // Delete associated replies
    await prisma.reply.deleteMany({
        where: { message_id: id },
    })

    // delete the quesiton
    return prisma.question.delete({ where: { id } })
}
