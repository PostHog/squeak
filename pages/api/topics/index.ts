import type { NextApiRequest, NextApiResponse } from 'next'

import { orgIdNotFound, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import { corsMiddleware, allowedOrigin } from '../../../lib/middleware'
import nextConnect from 'next-connect'
import getActiveOrganization from '../../../util/getActiveOrganization'

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(handleGetTopics)
    .get(handleGetTopics)

export type GetTopicsResponse = { id: number; label: string }[] | []

// POST /api/topics
// Public API to retrieve a list of topics for the org
async function handleGetTopics(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = req.body.organizationId || req.query.organizationId || getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const topics = await prisma.topic.findMany({
        where: { organization_id: organizationId },
        select: {
            label: true,
            id: true,
        },
    })

    safeJson(res, topics)
}

export default handler
