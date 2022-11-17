import type { NextApiRequest, NextApiResponse } from 'next'

import { notAuthenticated, safeJson } from 'src/lib/api/apiUtils'
import nextConnect from 'next-connect'
import { corsMiddleware, allowedOrigin } from 'src/lib/middleware'
import { getSessionUser } from 'src/lib/auth'
import prisma from 'src/lib/db'
import { addPersonToCustomerIO } from 'src/util/customerIO'

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(subscribeToRoadmapItem)

async function subscribeToRoadmapItem(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user) return notAuthenticated(res)

    const { id } = req.body

    if (!id) return res.status(500).json({ error: 'No roadmap ID provided' })

    await prisma.roadmap
        .update({
            where: {
                id,
            },
            data: {
                subscribers: { connect: { id: user.profileId } },
            },
        })
        .catch((err) => console.log(err))

    await addPersonToCustomerIO({ user, res })

    return res.status(200).json({ success: 'User subscribed' })
}

export default handler
