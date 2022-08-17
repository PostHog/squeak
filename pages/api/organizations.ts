import type { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, notAuthenticated } from '../../lib/api/apiUtils'
import { getSessionUser } from '../../lib/auth'
import prisma from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return await handleGet(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export interface GetOrganizationsResponse {
    organization_id: string
}

// GET /api/organizations
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user) {
        return notAuthenticated(res)
    }

    const orgIds: GetOrganizationsResponse[] = await prisma.profileReadonly.findMany({
        where: { user_id: user.id },
        select: { organization_id: true },
    })

    res.status(200).json(orgIds)
}
