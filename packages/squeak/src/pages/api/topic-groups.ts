import { TopicGroup, Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'

interface CreateTopicGroupRequestBody {
    label: string
}

const topicGroupsWithTopics = Prisma.validator<Prisma.TopicGroupArgs>()({
    select: { topic: true, id: true, label: true, organization_id: true, created_at: true },
})

export type GetTopicGroupsResponse = Prisma.TopicGroupGetPayload<typeof topicGroupsWithTopics>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handlePost(req, res)
        case 'GET':
            return handleGet(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const body: CreateTopicGroupRequestBody = req.body

    const topicGroup: TopicGroup = await prisma.topicGroup.create({
        data: {
            label: body.label,
            organization_id: user.organizationId,
        },
    })

    safeJson(res, topicGroup, 201)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = req.body.organizationId || req.query.organizationId

    const topicGroups: TopicGroup[] = await prisma.topicGroup.findMany({
        where: {
            organization_id: organizationId,
        },
        select: {
            created_at: true,
            organization_id: true,
            label: true,
            id: true,
            topic: true,
        },
    })

    safeJson(res, topicGroups, 201)
}
