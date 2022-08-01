import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

import { safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import { validateBody, allowedOrigin, corsMiddleware, requireOrgAdmin } from '../../../lib/middleware'
import { Reply } from '@prisma/client'

const schema = {
    type: 'object',
    properties: {
        organizationId: 'string',
    },
    required: ['organizationId'],
    additionalProperties: true,
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .use(validateBody(schema))
    .use(requireOrgAdmin)
    .delete(handleDelete)
    .patch(handlePatch)

export interface UpdateReplyPayload {
    published: boolean
    organizationId: string
}

async function findReply(req: NextApiRequest, res: NextApiResponse): Promise<Reply | boolean> {
    const id = parseInt(req.query.id as string)
    const organizationId = req.body.organizationId

    const reply = await prisma.reply.findFirst({
        where: { organization_id: organizationId, id },
    })

    if (!reply) {
        res.status(404).json({ error: 'Reply not found' })
        return false
    }

    return reply
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id as string)
    const body: UpdateReplyPayload = req.body

    const { published } = body

    let reply = await findReply(req, res)
    if (!reply) return

    reply = await prisma.reply.update({
        where: { id },
        data: { published },
    })

    safeJson(res, reply)
}

// DELETE /api/replies/[id]
// Used both by the dashboard and react sdk to allow moderators to delete replies
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id as string)
    const reply = await findReply(req, res)
    if (!reply) return false

    await prisma.reply.delete({
        where: { id },
    })

    res.status(200).json({ success: true })
}

export default handler
