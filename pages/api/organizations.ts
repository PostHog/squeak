import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from '../../lib/api/apiUtils'
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession()
    if (!session) {
        return res.status(401).json({ error: 'not authenticated' })
    }

    const orgIds: GetOrganizationsResponse[] = await prisma.profileReadonly.findMany({
        where: { user_id: session?.user.id },
        select: { organization_id: true },
    })

    res.status(200).json(orgIds)
}
