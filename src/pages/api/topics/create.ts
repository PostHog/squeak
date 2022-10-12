import { Topic } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'

import { methodNotAllowed, orgIdNotFound, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handlePost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// POST /api/topics/create
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user) return orgIdNotFound(res)

    const body = req.body
    const topicGroupId = body.topicGroupId && parseInt(body.topicGroupId)

    const topic: Topic = await prisma.topic.create({
        data: {
            label: body.label,
            topic_group_id: topicGroupId,
            organization: {
                connect: {
                    id: user.organizationId,
                },
            },
        },
    })

    safeJson(res, topic, 201)
}
