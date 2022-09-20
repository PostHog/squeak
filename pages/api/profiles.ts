import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import { requireOrgAdmin, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'
import { Prisma, ProfileReadonly } from '@prisma/client'

const profilesReadOnlyWithTopics = Prisma.validator<Prisma.ProfileReadonlyArgs>()({
    select: { Team: true, id: true, role: true, user_id: true, profile: true, teamId: true },
})

export type GetProfilesReadOnlyResponse = Prisma.ProfileReadonlyGetPayload<typeof profilesReadOnlyWithTopics>

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

export type GetProfilesResponse = GetProfilesReadOnlyResponse

// GET /api/profiles
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    const profiles = await prisma.profileReadonly.findMany({
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
            Team: true,
            teamId: true,
        },
    })
    safeJson(res, profiles)
}
