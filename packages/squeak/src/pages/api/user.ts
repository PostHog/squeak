import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'

import passport from '../../lib/passport'
import { getLoginSession } from '../../lib/auth/'
import prisma from '../../lib/db'
import { corsMiddleware } from '../../lib/middleware'
import { notAuthenticated, safeJson } from '../../lib/api/apiUtils'
import { Profile, User } from '@prisma/client'

export function safeSerializeUser(user: Pick<User, 'id' | 'email'>, profile: Profile) {
    return {
        id: user.id,
        email: user.email,
        profile,
        isModerator: profile.role === 'moderator' || profile.role === 'admin',
    }
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(passport.initialize())
    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        const session = await getLoginSession(req)
        if (!session) return notAuthenticated(res)

        const user = await prisma.user.findUnique({
            where: { id: session.user_id },
            select: {
                id: true,
                email: true,
                profiles: {
                    where: { organization_id: session.org_id },
                    include: {
                        subscriptions: true,
                    },
                },
            },
        })

        if (!user) return res.status(401).json({ error: 'Not authenticated' })

        const profile = user.profiles && user.profiles[0]

        if (!profile) return res.status(401).json({ error: 'Profile not found' })

        safeJson(res, safeSerializeUser(user, profile))
    })

export default handler
