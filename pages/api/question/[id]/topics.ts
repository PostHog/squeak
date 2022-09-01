import NextCors from 'nextjs-cors'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, requireOrgAdmin } from '../../../../lib/api/apiUtils'
import checkAllowedOrigins from '../../../../util/checkAllowedOrigins'
import prisma from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
        case 'PATCH':
            return handlePatch(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// PATCH /api/question/[id]/topics
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    const question = await findQuestion(req, res)
    if (!question) return
    if (!(await requireOrgAdmin(req, res))) return

    const { topics } = req.body

    await prisma.question.update({
        where: { id: parseInt(req.query.id as string) },
        data: { topics },
    })

    return res.status(200).json(topics)
}

export type GetQuestionTopicsResponse = string[] | [] | null

// GET /api/question/[id]/topics
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const question = await findQuestion(req, res)
    if (!question) return

    const topics: GetQuestionTopicsResponse = question.topics

    return res.status(200).json(topics)
}

async function findQuestion(req: NextApiRequest, res: NextApiResponse): Promise<{ topics: string[] } | undefined> {
    const question = await prisma.question.findUnique({
        where: { id: parseInt(req.query.id as string) },
        select: {
            topics: true,
        },
    })

    if (!question) {
        res.status(404).json({ error: 'Question not found' })
        return
    }

    return question
}
