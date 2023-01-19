import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'
import { requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import nc from 'next-connect'
import getGravatar from 'gravatar'
import { allowedOrigin, corsMiddleware, validateBody } from '../../../lib/middleware'

const handler = nc<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .get(handleGet)
    .patch(handlePatch)
export interface UpdateProfilePayload {
    role?: string
    teamId?: string
    image?: {
        id: string
        cloud_name: string
        version: string
        publicId: string
        format: string
    }
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

const allowed = [
    'first_name',
    'last_name',
    'website',
    'github',
    'linkedin',
    'twitter',
    'biography',
    'teamId',
    'role',
    'image',
]

const getAvatar = async (email) => {
    const gravatar = getGravatar.url(email || '')
    return await fetch(`https:${gravatar}?d=404`).then((res) => (res.ok && `https:${gravatar}`) || null)
}

// PATCH /api/profiles/[id]
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    const profileId = req.query.id as string
    const session = await getSessionUser(req)
    if (!session) return res.status(403)
    if ((await requireOrgAdmin(req, res)) || session?.profileId === profileId) {
        const params: UpdateProfilePayload = req.body
        if (!params || Object.keys(params).some((param) => !allowed.includes(param))) return res.status(500)
        const { teamId, image, ...other } = params
        let avatar = image
            ? `https://res.cloudinary.com/${image.cloud_name}/v${image.version}/${image.publicId}.${image.format}`
            : await getAvatar(session.email)
        const data = {
            ...(teamId ? { team_id: teamId === 'None' ? null : parseInt(teamId) } : {}),
            ...(image ? { imageId: image?.id } : {}),
            ...other,
            avatar,
        }

        const profile = await prisma.profile.update({
            where: { id: profileId },
            data,
        })

        safeJson(res, profile)
    } else {
        return res.status(403).json({ error: 'Not authorized' })
    }
}

export default handler
