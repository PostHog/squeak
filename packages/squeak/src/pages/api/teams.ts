import { Prisma, Team } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'

const teamWithProfiles = Prisma.validator<Prisma.TeamArgs>()({
    include: {
        profiles: true,
        Roadmap: {
            include: {
                team: true,
                image: true,
            },
        },
    },
})

export type GetTeamResponse = Prisma.TeamGetPayload<typeof teamWithProfiles>

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
    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const body = req.body

    const topicGroup: Team = await prisma.team.create({
        data: {
            organization_id: user.organizationId,
            name: body.name,
        },
    })

    safeJson(res, topicGroup, 201)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const organizationId = req.body.organizationId || user.organizationId

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
