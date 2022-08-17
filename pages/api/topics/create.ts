import { Topic } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import getActiveOrganization from '../../../util/getActiveOrganization'

interface CreateTopicRequestBody {
    label: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handlePost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// POST /api/topics/create
// Retrieves a list of topics for the org
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const body: CreateTopicRequestBody = req.body

    const topic: Topic = await prisma.topic.create({
        data: {
            label: body.label,
            organization_id: organizationId,
        },
    })

    safeJson(res, topic, 201)
}
