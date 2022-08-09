import { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { hashPassword } from '../../../db'
import prisma from '../../../lib/db'
import { corsMiddleware } from '../../../lib/middleware'

const handler = nextConnect().use(corsMiddleware).post(doResetPassword)

async function doResetPassword(req: NextApiRequest, res: NextApiResponse) {
    const { token, password } = req.body

    if (!token || token === '' || !password || password === '') {
        res.status(400).json({ error: 'token and password are required' })
    }

    const user = await prisma.user.findFirst({
        where: { recovery_token: token },
    })

    if (!user) return res.status(400).json({ error: 'invalid token' })

    const encrypted = await hashPassword(password)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            recovery_token: null,
            encrypted_password: encrypted,
        },
    })

    res.status(200).json({ success: true })
}

export default handler
