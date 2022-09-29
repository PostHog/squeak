import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { User } from '@prisma/client'

import passport from '../../lib/passport'
import { setLoginSession, setOrgIdCookie } from '../../lib/auth/'
import prisma from '../../lib/db'
import { isSDKRequest } from '../../lib/api/apiUtils'

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
    let orgId: string

    // Set the org id based on whether this is a squeak.cloud login or an sdk login
    if (isSDKRequest(req)) {
        orgId = req.body.organizationId
        if (!orgId) return res.status(400).json({ error: 'Missing required field organizationId' })
    } else {
        // Log the user into the first org they have access to
        const readOnly = await prisma.profileReadonly.findFirst({
            where: { user_id: req.user.id },
        })

        if (!readOnly || !readOnly.organization_id) return res.status(500).json({ error: 'User has no orgs' })

        // set the active organization
        orgId = readOnly.organization_id
    }

    setOrgIdCookie(res, orgId)

    return res.status(200).json({ success: true, id: req.user.id })
}

export default handler
