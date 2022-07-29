import { Question } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { deleteQuestion, UpdateQuestionParams } from '../../../db/question'

import { updateQuestion } from '../../../db/question'
import { methodNotAllowed, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

// PATCH /api/question/[id]/edit
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'PATCH':
            return await doUpdateQuestion(req, res)
        case 'DELETE':
            return await doDeleteQuestion(req, res)
        case 'GET':
            return await doGetQuestion(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// GET /api/question/[id]
async function doGetQuestion(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id as string)

    // allow the client to specify which fields to select from the db and return
    const onlyFields = req.query.onlyFields as string
    const select: { [key: string]: boolean } = {}

    if (onlyFields && onlyFields !== '') {
        onlyFields.split(',').forEach((field: string) => {
            select[field] = true
        })
    }

    let question: Question | Partial<Question> | null = null

    if (onlyFields && onlyFields.length > 0) {
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

    safeJson(res, question)
}

// DELETE /api/question/[id]
async function doDeleteQuestion(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const id = parseInt(req.query.id as string)

    await deleteQuestion(id)

    res.status(200)
}

// PATCH /api/question/[id]
export async function doUpdateQuestion(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const id = parseInt(req.query.id as string)

    const params: UpdateQuestionParams = req.body
    const question = await updateQuestion(id, params)

    res.status(200).json(question)
}
