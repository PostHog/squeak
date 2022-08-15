import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { User } from '@prisma/client'

import passport from '../../lib/passport'
import { setLoginSession } from '../../lib/auth/'
import prisma from '../../lib/db'
import { setCookie } from 'nookies'

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
    .post(passport.authenticate('local', { session: false, failureMessage: false, failWithError: true }), handleLogin)

async function handleLogin(req: NextApiRequest & { user: User }, res: NextApiResponse) {
    await setLoginSession(res, req.user.id)

    const readOnly = await prisma.profileReadonly.findFirst({
        where: { user_id: req.user.id },
    })

    // set the active organization
    if (readOnly) {
        setCookie({ res }, 'squeak_organization_id', `${readOnly.organization_id}`, { path: '/' })
    }

    return res.status(200).json({ success: true, id: req.user.id })
}

export default handler
