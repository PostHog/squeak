import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'
const { APIClient, RegionEU } = require('customerio-node')
import { marked } from 'marked'
import { methodNotAllowed, orgIdNotFound, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handlePost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const { emails, content, subject } = req.body

    if (!emails || !content || !subject) return safeJson(res, { error: 'Missing required fields' })

    const config = await prisma.squeakConfig.findFirst({
        where: {
            organization_id: user?.organizationId,
        },
        select: {
            customer_io_broadcast_id: true,
            customer_io_app_api_key: true,
        },
    })

    if (!config) return safeJson(res, { error: 'Missing Customer.io fields' })

    const api = new APIClient(config.customer_io_app_api_key, { region: RegionEU })

    const data = {
        content: marked.parse(content),
        subject,
    }

    const broadcast = await api
        .triggerBroadcast(config.customer_io_broadcast_id, data, { emails })
        .catch((err) => console.error(err))

    safeJson(res, broadcast, 201)
}
