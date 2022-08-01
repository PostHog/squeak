import { Reply } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { safeJson } from '../../../lib/api/apiUtils'

import prisma from '../../../lib/db'
import { corsMiddleware, validateBody } from '../../../lib/middleware'
import nextConnect from 'next-connect'

const schema = {
    type: 'object',
    properties: {
        createdAt: { type: 'string' },
        message_id: { type: 'number' },
        organization_id: { type: 'string' },
        profile_id: { type: 'string' },
        published: { type: 'boolean' },
    },
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(validateBody(schema, { coerceTypes: true }))
    .post(handlePost)

export type CreateReplyResponse = Reply

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const data: CreateReplyResponse = await prisma.reply.create({
        data: req.body,
    })
    safeJson(res, data, 201)
}

export default handler
