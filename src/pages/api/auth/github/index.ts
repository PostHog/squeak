import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'

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
        passport.authenticate('github', {
            scope: ['user:email'],
            session: false,
            failureMessage: false,
            failWithError: true,
        })
    )

export default handler
