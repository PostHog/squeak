import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import getActiveOrganization from '../../../util/getActiveOrganization'

const topicGroupsWithTopics = Prisma.validator<Prisma.TopicGroupArgs>()({
    select: { Topic: true, id: true, label: true, organization_id: true, created_at: true },
})

export type GetTopicGroupsResponse = Prisma.TopicGroupGetPayload<typeof topicGroupsWithTopics>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'PATCH':
            return handlePatch(req, res)
        case 'DELETE':
            return handleDelete(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const id = parseInt(req.query.id as string)

    const { date_completed, projected_completion_date, ...other } = req.body

    const roadmap = await prisma.roadmap
        .update({
            where: {
                id,
            },
            data: {
                ...other,
                date_completed: date_completed ? new Date(date_completed) : null,
                projected_completion_date: projected_completion_date ? new Date(projected_completion_date) : null,
            },
        })

        .catch((err) => console.log(err))

    safeJson(res, roadmap, 201)
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)
    const id = parseInt(req.query.id as string)

    await prisma.roadmap.delete({
        where: { id },
    })

    res.status(200).json({ success: true })
}
