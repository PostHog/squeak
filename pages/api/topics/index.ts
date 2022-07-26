import type { NextApiRequest, NextApiResponse } from 'next'

import { orgIdNotFound, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import { corsMiddleware, allowedOrigin } from '../../../lib/middleware'
import nextConnect from '../../../lib/next-connect'

const handler = nextConnect.use(corsMiddleware).use(allowedOrigin).post(handleGetTopics)

export type GetTopicsResponse = { id: bigint | number; label: string }[] | []

// POST /api/topics
// Public API to retrieve a list of topics for the org
async function handleGetTopics(req: NextApiRequest, res: NextApiResponse) {
    const { organizationId } = req.body
    if (!organizationId) return orgIdNotFound(res)

    const topics: GetTopicsResponse = await prisma.topic.findMany({
        where: { organization_id: organizationId },
        select: {
            label: true,
            id: true,
        },
    })

    safeJson(res, topics)
}

export default handler
