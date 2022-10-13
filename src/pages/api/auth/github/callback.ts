import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { setLoginSession } from 'src/lib/auth'
import prisma from 'src/lib/db'

import passport from 'src/lib/passport'

const handler = nextConnect<NextApiRequest, NextApiResponse>({})
    .use(async (req, res, next) => {
        const controlHeaders = req.headers['access-control-request-headers'] || ''

        res.setHeader('Access-Control-Allow-Headers', controlHeaders)
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE')
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
        res.setHeader('Access-Control-Allow-Credentials', 'true')

        if (req.method === 'OPTIONS') {
            res.status(200)
            res.end()
        }

        next()
    })
    .use(passport.initialize())
    .get(
        passport.authenticate('github', { failureRedirect: '/login', session: false, failWithError: true }),
        async (req: NextApiRequest & { user: User }, res) => {
            // Log the user into the first org they have access to
            const profile = await prisma.profile.findFirst({
                where: { user_id: req.user.id },
                select: {
                    id: true,
                    organization_id: true,
                },
            })

            if (!profile || !profile.organization_id) return res.redirect('/signup')

            const orgId = profile.organization_id
            const profileId = profile.id

            await setLoginSession(res, req.user.id, orgId, profileId)

            return res.redirect('/')
        }
    )

export default handler
