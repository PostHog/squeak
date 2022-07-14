import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, orgIdNotFound } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

import checkAllowedOrigins from '../../../util/checkAllowedOrigins'

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
        case 'GET': // TODO: move squeak-react call to GET
        case 'POST':
            return handleGetTopics(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export type GetTopicsResponse = { id: bigint | number; label: string }[] | []

// POST /api/topics
// Public API to retrieve a list of topics for the org
async function handleGetTopics(req: NextApiRequest, res: NextApiResponse) {
    const { organizationId } = JSON.parse(req.body)
    if (!organizationId) return orgIdNotFound(res)

    const topics: GetTopicsResponse = await prisma.topic.findMany({
        where: { organization_id: organizationId },
        select: {
            label: true,
            id: true,
        },
    })

    res.status(200).json(topics)
}
