import { TopicGroup, Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import getActiveOrganization from '../../../util/getActiveOrganization'

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
        default:
            return methodNotAllowed(res)
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const { organizationId: _orgId, teamId, date_completed, projected_completion_date, ...other } = req.body

    const roadmap = await prisma.roadmap
        .create({
            data: {
                ...other,
                organization_id: organizationId,
                teamId: parseInt(teamId),
                date_completed: date_completed ? new Date(date_completed) : null,
                projected_completion_date: projected_completion_date ? new Date(projected_completion_date) : null,
            },
        })
        .catch((err) => console.log(err))

    safeJson(res, roadmap, 201)
}
