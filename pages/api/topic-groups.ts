import { TopicGroup, Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'

interface CreateTopicGroupRequestBody {
    label: string
}

const topicGroupsWithTopics = Prisma.validator<Prisma.TopicGroupArgs>()({
    select: { Topic: true, id: true, label: true, organization_id: true, created_at: true },
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
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const body: CreateTopicGroupRequestBody = req.body

    const topicGroup: TopicGroup = await prisma.topicGroup.create({
        data: {
            label: body.label,
            organization_id: organizationId,
        },
    })

    safeJson(res, topicGroup, 201)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const topicGroups: TopicGroup[] = await prisma.topicGroup.findMany({
        where: {
            organization_id: organizationId,
        },
        select: {
            created_at: true,
            organization_id: true,
            label: true,
            id: true,
            Topic: true,
        },
    })

    safeJson(res, topicGroups, 201)
}
