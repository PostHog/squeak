import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { orgIdNotFound, requireOrgAdmin } from '../../lib/api/apiUtils'

import prisma from '../../lib/db'
import { corsMiddleware, allowedOrigin } from '../../lib/middleware'
import nextConnect from '../../lib/next-connect'
import getActiveOrganization from '../../util/getActiveOrganization'

const handler = nextConnect
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(handleGetConfig)
    .get(handleGetConfig)
    .patch(handlePatch)

// POST /api/config
// Public API to retrieve config for the org
async function handleGetConfig(req: NextApiRequest, res: NextApiResponse) {
    let organizationId: string
    if (req.method === 'POST') {
        const params = req.body
        organizationId = params.organizationId
    } else {
        organizationId = req.query.organizationId as string
    }

    if (!organizationId) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: { permalink_base: true, permalinks_enabled: true },
    })

    res.status(200).json(config)
}

export type UpdateConfigPayload = Pick<
    Prisma.SqueakConfigUpdateInput,
    | 'company_domain'
    | 'company_name'
    | 'slack_api_key'
    | 'slack_question_channel'
    | 'mailgun_api_key'
    | 'mailgun_domain'
    | 'mailgun_from_email'
    | 'mailgun_from_name'
    | 'allowed_origins'
    | 'question_auto_publish'
    | 'reply_auto_publish'
    | 'show_slack_user_profiles'
>

// PATCH /api/config
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = await getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    if (!(await requireOrgAdmin(req, res))) return

    const body: UpdateConfigPayload = JSON.parse(req.body)

    // find config object id
    let config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
    })

    if (!config) return res.status(500).json({ error: 'No config found' })

    config = await prisma.squeakConfig.update({
        where: { id: config.id },
        data: body,
    })

    res.status(200).json(config)
}

export default handler
