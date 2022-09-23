import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import getActiveOrganization from '../../../util/getActiveOrganization'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
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
