import prisma from '../../../../lib/db'
import { setLoginSession, setOrgIdCookie } from 'lib/auth'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import passport from '../../../../lib/passport'

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

        console.log(`serving ${req.method} request`)
        next()
    })
    .use(passport.initialize())
    .get(passport.authenticate('github', { session: false, failureRedirect: '/login' }), async (req, res) => {
        if (req.user) {
            await setLoginSession(res, req.user.id)

            // TODO: Allow users to log in to multiple orgs
            // Log the user into the first org they have access to
            const readOnly = await prisma.profileReadonly.findFirst({
                where: { user_id: req.user.id },
            })

            if (readOnly?.organization_id) {
                setOrgIdCookie(res, readOnly?.organization_id)
                res.redirect(302, '/questions')
            } else {
                res.redirect(302, '/signup/profile')
            }
        }
    })

export default handler
