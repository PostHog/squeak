import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import { requireOrgAdmin, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'
import { Prisma } from '@prisma/client'
import { getSessionUser } from 'src/lib/auth'

const profilesReadOnlyWithTopics = Prisma.validator<Prisma.ProfileArgs>()({
    select: {
        team: true,
        id: true,
        role: true,
        user_id: true,
        team_id: true,
        first_name: true,
        last_name: true,
        avatar: true,
    },
})

export type GetProfilesReadOnlyResponse = Prisma.ProfileGetPayload<typeof profilesReadOnlyWithTopics>

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

    const user = await getSessionUser(req)

    if (!user) {
        return
    }

    const profiles = await prisma.profile.findMany({
        where: { organization_id: user.organizationId },
        select: {
            id: true,
            role: true,
            user_id: true,
            first_name: true,
            last_name: true,
            avatar: true,
            team: true,
            team_id: true,
        },
    })
    safeJson(res, profiles)
}
