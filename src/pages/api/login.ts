import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { User } from '@prisma/client'

import passport from '../../lib/passport'
import { setLoginSession } from '../../lib/auth/'
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

        next()
    })
    .use(passport.initialize())
    .post(passport.authenticate('local', { session: false, failureMessage: false, failWithError: true }), handleLogin)

async function handleLogin(req: NextApiRequest & { user: User }, res: NextApiResponse) {
    let orgId: string
    let profileId: string

    // Set the org id based on whether this is a squeak.cloud login or an sdk login
    if (isSDKRequest(req)) {
        orgId = req.body.organizationId
        if (!orgId) return res.status(400).json({ success: true, error: 'Missing required field organizationId' })

        const profile = await prisma.profile.findFirst({
            where: { organization_id: orgId, user_id: req.user.id },
            select: { id: true },
        })

        if (!profile) return res.status(403).json({ success: true, error: 'User is not part of this organization' })

        profileId = profile.id
    } else {
        // TODO: Allow the user to log in to any organization, not just the first

        // Log the user into the first org they have access to
        const profile = await prisma.profile.findFirst({
            where: { user_id: req.user.id },
            select: {
                id: true,
                organization_id: true,
            },
        })

        if (!profile || !profile.organization_id)
            return res.status(500).json({ success: false, error: 'User has no orgs' })

        orgId = profile.organization_id
        profileId = profile.id
    }

    await setLoginSession(res, req.user.id, orgId, profileId)

    return res.status(200).json({ success: true, id: req.user.id })
}

export default handler
