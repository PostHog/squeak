import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import { requireOrgAdmin, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    switch (req.method) {
        case 'GET':
            return await handleGet(req, res)
        default:
            break
    }
}

export interface GetProfilesProfile {
    id: number | bigint
    role?: string
    user_id: string | null
    profile: {
        first_name: string | null
        last_name: string | null
        avatar: string | null
    }
}

export type GetProfilesResponse = GetProfilesProfile[]

// GET /api/profiles
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    const profiles: GetProfilesResponse = await prisma.profileReadonly.findMany({
        where: { organization_id: organizationId },
        select: {
            id: true,
            role: true,
            user_id: true,
            profile: {
                select: {
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
        },
    })
    safeJson(res, profiles)
}
