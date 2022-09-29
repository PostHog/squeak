import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import { methodNotAllowed, orgIdNotFound, requireOrgAdmin } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import checkAllowedOrigins from '../../../util/checkAllowedOrigins'
import getActiveOrganization from '../../../util/getActiveOrganization'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    switch (req.method) {
        case 'DELETE':
            return handleDelete(req, res)
        case 'PATCH':
            return handlePatch(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// DELETE /api/topics/[id]
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)
    if (!(await requireOrgAdmin(req, res))) return

    const id = parseInt(req.query.id as string)

    await prisma.topic.deleteMany({
        where: { id, organization_id: organizationId },
    })

    // if (error) {
    //     console.error(`[Topics] ${error.message}`)
    //     res.status(500).json({ error: error.message })
    //     return
    // }

    res.status(200).json({})
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const { id, topicGroupId } = req.body

    await prisma.topic.updateMany({
        where: { id: parseInt(id), organization_id: organizationId },
        data: {
            topicGroupId: topicGroupId && parseInt(topicGroupId),
        },
    })

    res.status(200).json({})
}
