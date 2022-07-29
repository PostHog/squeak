import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, requireOrgAdmin } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return doGet(req, res)
        case 'POST':
            return doPost(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export interface FetchWebhooksPayload {
    type: string
    url: string
    id: number | bigint
}

// GET /api/webhooks
async function doGet(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })

    const webhooks: FetchWebhooksPayload[] = await prisma.webhookConfig.findMany({
        where: { organization_id: organizationId },
        select: { id: true, url: true, type: true },
    })
    res.status(200).json(webhooks)
}

export type CreateWebhookPayload = Pick<Prisma.WebhookConfigUncheckedCreateInput, 'url' | 'type'>

// POST /api/webhooks
async function doPost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })

    const data: CreateWebhookPayload & { organization_id: string } = req.body
    data.organization_id = organizationId

    const webhook = await prisma.webhookConfig.create({ data })

    res.status(201).json(webhook)
}
