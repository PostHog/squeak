import type { NextApiRequest, NextApiResponse } from 'next'
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

        if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
            res.redirect(302, '/login?error_code=improperly_configured_sso')
        }

        next()
    })
    .use(passport.initialize())
    .get(passport.authenticate('github', { session: false, scope: ['user:email'] }))

export default handler
