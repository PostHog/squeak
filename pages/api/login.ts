import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { User } from '@prisma/client'

import passport from '../../lib/passport'
import { setLoginSession } from '../../lib/auth/'

const handler = nextConnect<NextApiRequest, NextApiResponse>({})

handler
    .use(async (req, res, next) => {
        const controlHeaders = req.headers['access-control-request-headers'] || ''

        res.setHeader('Access-Control-Allow-Headers', controlHeaders)
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE')
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
        res.setHeader('Access-Control-Allow-Credentials', 'true')

        if (req.method === 'OPTIONS') {
            console.log('serving options request')

            res.status(200)
            res.end()
        }

        console.log(`serving ${req.method} request`)
        next()
    })
    .use(passport.initialize())
    .post(passport.authenticate('local', { session: false, failureMessage: false, failWithError: true }), handleLogin)

async function handleLogin(req: NextApiRequest & { user: User }, res: NextApiResponse) {
    // const token = generateToken(req.user)
    await setLoginSession(res, { user_id: req.user.id })

    return res.status(200).json({ success: true })
}

export default handler
