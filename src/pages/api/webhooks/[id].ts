import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, objectNotFound, requireOrgAdmin } from '../../../lib/api/apiUtils'
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
        case 'PATCH':
            return doPatch(req, res)
        case 'DELETE':
            return doDelete(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export type UpdateWebhookPayload = Pick<Prisma.WebhookConfigUncheckedUpdateInput, 'url'>

// PATCH /api/webhooks/[id]
async function doPatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const organizationId = getActiveOrganization({ req, res })
    const id = parseInt(req.query.id as string)

    const data = req.body

    let webhook = await prisma.webhookConfig.findFirst({
        where: { id, organization_id: organizationId },
        select: { id: true },
    })

    if (!webhook) return objectNotFound(res)

    webhook = await prisma.webhookConfig.update({
        where: { id: data.id },
        data,
    })

    res.status(200).json(webhook)
}

// DELETE /api/webhooks/[id]
async function doDelete(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })

    const id = parseInt(req.query.id as string)

    const webhook = await prisma.webhookConfig.findFirst({
        where: { id, organization_id: organizationId },
        select: { id: true },
    })

    if (!webhook) return objectNotFound(res)

    await prisma.webhookConfig.delete({
        where: { id },
    })

    res.status(200).json({ success: true })
}
