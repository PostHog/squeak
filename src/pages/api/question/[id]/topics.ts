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

    try {
        const question = await prisma.question.findUnique({
            where: { id: parseInt(req.query.id as string) },
            select: {
                id: true,
                topics: {
                    select: {
                        topic: true,
                    },
                },
            },
        })

        if (!question) {
            res.status(404).json({ error: 'Question not found' })
            return
        }

        if (req.method === 'GET') {
            return {
                topics: question.topics.map(({ topic }) => topic),
            }
        }

        // Admin privileges needed to add and delete
        if (!(await requireOrgAdmin(req, res))) return

        const { topics: topicIds }: { topics: string[] } = req.body

        if (req.method === 'POST') {
            const topics = await prisma.questionTopic.createMany({
                data: topicIds.map((topicId) => {
                    return {
                        question_id: question.id,
                        topic_id: BigInt(topicId),
                    }
                }),
                skipDuplicates: true,
            })

            res.status(200).json({ count: topics.count })
        } else if (req.method === 'DELETE') {
            const topics = await prisma.questionTopic.deleteMany({
                where: {
                    topic_id: {
                        in: topicIds.map((id) => BigInt(id)),
                    },
                },
            })

            res.status(200).json({ count: topics.count })
        } else {
            return methodNotAllowed(res)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({
            message: 'Something went wrong',
        })
    }
}
