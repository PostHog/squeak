import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

import { removeTokenCookie } from '../../lib/auth/cookies'
import { corsMiddleware } from '../../lib/middleware'
import { clearOrganization } from '../../util/getActiveOrganization'

const handler = nc<NextApiRequest, NextApiResponse>().use(corsMiddleware).post(doLogout).get(doLogout)

// POST /api/logout
async function doLogout(req: NextApiRequest, res: NextApiResponse) {
    await removeTokenCookie(res)
    clearOrganization(res)
    res.status(200).json({ success: true })
}

export default handler
