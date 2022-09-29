import type { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'PATCH':
            return handlePatch(req, res)
        default:
            return methodNotAllowed(res)
    }
}

export interface UpdateProfilePayload {
    role: string
}

// PATCH /api/profiles/[id]
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const profileId = parseInt(req.query.id as string)

    const params: UpdateProfilePayload = req.body
    if (!params.role) {
        res.status(400).json({ error: 'Missing role' })
        return
    }

    const profile = await prisma.profileReadonly.update({
        where: { id: profileId },
        data: { role: params.role },
    })

    safeJson(res, profile)
}
