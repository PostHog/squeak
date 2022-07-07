import { Prisma, SqueakConfig } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, orgIdNotFound, requireOrgAdmin } from '../../lib/api/apiUtils'

import prisma from '../../lib/db'
import getActiveOrganization from '../../util/getActiveOrganization'

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
        case 'PATCH':
            return handlePatch(req, res)
        default:
            return methodNotAllowed(res)
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const organizationId = await getActiveOrganization({ req, res })
    if (!organizationId) return orgIdNotFound(res)

    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
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
