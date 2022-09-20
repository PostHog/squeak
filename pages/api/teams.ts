import { Team } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'

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

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const body = req.body

    const topicGroup: Team = await prisma.team.create({
        data: {
            organization_id: organizationId,
            name: body.name,
        },
    })

    safeJson(res, topicGroup, 201)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = req.body.organizationId || req.query.organizationId || getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const teams: Team[] = await prisma.team.findMany({
        where: {
            organization_id: organizationId,
        },
        include: {
            profiles: true,
        },
    })

    safeJson(res, teams, 201)
}
