import { Topic } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, orgIdNotFound } from '../../../lib/api/apiUtils'
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
        case 'GET':
            return handleGet(req, res)
        case 'POST':
            return handlePost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

interface CreateTopicRequestBody {
    label: string
}

// POST /api/topics
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const body: CreateTopicRequestBody = JSON.parse(req.body)

    const topic: Topic = await prisma.topic.create({
        data: {
            label: body.label,
            organization_id: organizationId,
        },
    })

    res.status(200).json(topic)
}

export type GetTopicsResponse = { id: bigint | number; label: string }[] | []

// GET /api/topics
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const topics: GetTopicsResponse = await prisma.topic.findMany({
        where: { organization_id: organizationId },
        select: {
            label: true,
            id: true,
        },
    })

    res.status(200).json(topics)
}
