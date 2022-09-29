import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import getActiveOrganization from '../../../util/getActiveOrganization'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
        case 'PATCH':
            return handlePatch(req, res)
        case 'DELETE':
            return handleDelete(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const id = parseInt(req.query.id as string)

    const team = await prisma.team.findFirst({
        where: {
            id,
        },
        include: {
            Roadmap: {
                orderBy: {
                    date_completed: 'desc',
                },
            },
            profiles: {
                include: {
                    profile: true,
                    Team: true,
                },
            },
        },
    })

    safeJson(res, team, 201)
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const id = parseInt(req.query.id as string)

    const params = req.body

    const team = await prisma.team.update({
        where: {
            id,
        },
        data: params,
    })

    safeJson(res, team, 201)
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)
    const id = parseInt(req.query.id as string)

    await prisma.team.delete({
        where: { id },
    })

    await prisma.roadmap.deleteMany({
        where: {
            teamId: id,
        },
    })

    res.status(200).json({ success: true })
}
