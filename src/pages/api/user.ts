import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'

import passport from '../../lib/passport'
import { getLoginSession } from '../../lib/auth/'
import prisma from '../../lib/db'
import { corsMiddleware } from '../../lib/middleware'
import { notAuthenticated, safeJson } from '../../lib/api/apiUtils'
import getActiveOrganization from '../../util/getActiveOrganization'
import { Profile, User } from '@prisma/client'

export interface GetUserResponse {
    id: string
    email: string | null
    role: string | null
    isModerator: boolean
    profile: Profile
}

export function safeSerializeUser(user: Pick<User, 'id' | 'email' | 'role'>, profile: Profile): GetUserResponse {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
        isModerator: profile.role === 'moderator' || profile.role === 'admin',
    }
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(passport.initialize())
    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        let organizationId = req.query.organizationId as string
        if (!organizationId) {
            organizationId = getActiveOrganization({ req, res })
        }

        const session = await getLoginSession(req)
        if (!session) return notAuthenticated(res)

        if (!organizationId) return res.status(400).json({ error: '`organizationId` is a required param' })

        const user = await prisma.user.findUnique({
            where: { id: session.user_id },
            select: {
                id: true,
                email: true,
                role: true,
                profiles: {
                    where: { organization_id: organizationId },
                },
            },
        })

        if (!user) return res.status(401).json({ error: 'Not authenticated' })

        const profile = user.profiles && user.profiles[0]

        if (!profile) return res.status(401).json({ error: 'Profile not found' })

        safeJson(res, safeSerializeUser(user, profile))
    })

export default handler
