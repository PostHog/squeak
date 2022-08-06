import { NextApiRequest, NextApiResponse } from 'next'

import prisma from '../../../lib/db'
import { getSessionUser } from '../../../lib/auth'
import nextConnect from 'next-connect'
import { corsMiddleware } from '../../../lib/middleware'

const handler = nextConnect<NextApiRequest, NextApiResponse>().use(corsMiddleware).get(doCheck).post(doCheck)

async function doCheck(req: NextApiRequest, res: NextApiResponse) {
    const { organizationId } = req.body

    if (!organizationId) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const user = await getSessionUser(req)

    if (!user) {
        console.error(`[🧵 Check] Error fetching user profile from token`)
        res.status(500).json({ error: 'Error fetching user profile from token' })
        return
    }

    const profile = await prisma.profileReadonly.findFirst({
        where: { organization_id: organizationId },
        select: { id: true },
    })

    res.status(200).json({ hasProfile: !!profile })
}

export default handler
