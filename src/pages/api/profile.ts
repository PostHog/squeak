import { NextApiRequest, NextApiResponse } from 'next'

import nextConnect from 'next-connect'
import { corsMiddleware, validateBody } from '../../lib/middleware'
import { getSessionUser } from '../../lib/auth'
import { notAuthenticated } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import { updateUserPassword } from '../../db'

const schema = {
    type: 'object',
    properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        password: { type: 'string' },
    },
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(validateBody(schema))
    .patch(doPatch)

// PATCH /api/profile
async function doPatch(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user) return notAuthenticated(res)

    const { first_name, last_name, password } = req.body

    const profile = await prisma.profile.findFirst({
        where: { user_id: user.id },
    })

    await prisma.profile.update({
        where: { id: profile?.id },
        data: { first_name, last_name },
    })

    if (password && password !== '') {
        await updateUserPassword(user, password)
    }
    res.status(200).json({ success: true })
}

export default handler
