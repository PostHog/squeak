import type { NextApiRequest, NextApiResponse } from 'next'
import { confirmUser, findUserByConfirmationToken } from '../../../db'
import { methodNotAllowed } from '../../../lib/api/apiUtils'
// import { setLoginSession } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return handleGet(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// GET /api/user/confirm?confirmation_token=TOKEN&redirect=URL
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { token, redirect } = req.query

    if (!token || token === '') return res.status(400).json({ error: 'Confirmation token is required' })

    const user = await findUserByConfirmationToken(token as string)

    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    await confirmUser(user)
    // await setLoginSession(res, user.id)

    res.redirect(redirect as string)
}
