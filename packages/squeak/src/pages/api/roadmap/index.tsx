import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

const roadmap = Prisma.validator<Prisma.RoadmapArgs>()({
    include: {
        team: true,
        image: true,
        subscribers: true,
    },
})

export type GetRoadmapResponse = Prisma.RoadmapGetPayload<typeof roadmap>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
        case 'POST':
            return handlePost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const user = req.body.organizationId || req.query.organizationId || (await getSessionUser(req))

    if (!user) return orgIdNotFound(res)

    const roadmap = await prisma.roadmap.findMany({
        where: {
            organization_id: user.organizationId,
        },
        include: {
            team: true,
            image: true,
            subscribers: true,
        },
        orderBy: {
            date_completed: 'desc',
        },
    })

    safeJson(res, roadmap, 201)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const { teamId, date_completed, projected_completion_date, ...other } = req.body

    const roadmap = await prisma.roadmap
        .create({
            data: {
                ...other,
                organization_id: user.organizationId,
                ...(teamId ? { teamId: parseInt(teamId) } : {}),
                date_completed: date_completed ? new Date(date_completed) : null,
                projected_completion_date: projected_completion_date ? new Date(projected_completion_date) : null,
            },
        })
        .catch((err) => console.log(err))

    safeJson(res, roadmap, 201)
}
