import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

import { removeTokenCookie } from '../../lib/auth/cookies'
import { corsMiddleware } from '../../lib/middleware'
import { clearOrganization } from '../../util/getActiveOrganization'

const handler = nc<NextApiRequest, NextApiResponse>().use(corsMiddleware).post(doLogout).get(doLogout)

// POST /api/logout
async function doLogout(_: NextApiRequest, res: NextApiResponse) {
    try {
        removeTokenCookie(res)
        clearOrganization(res)

        res.status(200).send({ success: true })
    } catch (error) {
        // TODO: Log in Sentry
        console.error(error)

        res.status(500).send({ error: "Something went wrong and we couldn't log you out" })
    }
}

export default handler
