import { NextApiRequest, NextApiResponse } from 'next'

import { removeTokenCookie } from '../../lib/auth/cookies'
import { allowedOrigin, corsMiddleware } from '../../lib/middleware'
import nc from '../../lib/next-connect'

const handler = nc.use(corsMiddleware).use(allowedOrigin).post(doLogout)

// POST /api/logout
async function doLogout(req: NextApiRequest, res: NextApiResponse) {
    removeTokenCookie(res)
    res.status(200).json({ success: true })
}

export default handler
