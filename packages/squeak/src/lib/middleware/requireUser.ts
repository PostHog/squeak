import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from '../auth'

export async function requireUser(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    const user = await getSessionUser(req)
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    req.user = user

    next()
}
