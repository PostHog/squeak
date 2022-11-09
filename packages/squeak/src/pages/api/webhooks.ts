import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from 'src/lib/auth'
import { methodNotAllowed, requireOrgAdmin, safeJson } from '../../lib/api/apiUtils'
import prisma from '../../lib/db'

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

    const user = await getSessionUser(req)

    if (!user) return

    const webhooks: FetchWebhooksPayload[] = await prisma.webhookConfig.findMany({
        where: { organization_id: user.organizationId },
        select: { id: true, url: true, type: true },
    })
    safeJson(res, webhooks)
}

export type CreateWebhookPayload = Pick<Prisma.WebhookConfigUncheckedCreateInput, 'url' | 'type'>

// POST /api/webhooks
async function doPost(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const user = await getSessionUser(req)

    if (!user) return

    const data: CreateWebhookPayload & { organization_id: string } = req.body
    data.organization_id = user.organizationId

    const webhook = await prisma.webhookConfig.create({ data })

    safeJson(res, webhook, 201)
}
