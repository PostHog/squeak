import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PATCH'],
        origin: '*',
    })

    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
        case 'PATCH':
            return handlePatch(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export interface UpdateProfilePayload {
    role?: string
    teamId?: string
}

// GET /api/profiles/[id]
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const profileId = req.query.id as string

    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar: true,
            biography: true,
            email: true,

            github: true,
            linkedin: true,
            twitter: true,
            website: true,

            company: true,
            company_role: true,

            team: {
                include: {
                    profiles: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                            company_role: true,
                        },
                    },
                },
            },
        },
    })

    if (!profile) {
        res.status(404)
    } else {
        safeJson(res, profile)
    }
}

// PATCH /api/profiles/[id]
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const profileId = req.query.id as string

    const params: UpdateProfilePayload = req.body
    if (!params.role && !params.teamId) {
        res.status(400).json({ error: 'Missing params' })
        return
    }

    const profile = await prisma.profile.update({
        where: { id: profileId },
        data: {
            ...(params.role ? { role: params?.role } : {}),
            ...(params.teamId ? { team_id: params?.teamId === 'None' ? null : parseInt(params.teamId) } : {}),
        },
    })

    safeJson(res, profile)
}
