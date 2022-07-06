import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { methodNotAllowed, requireOrgAdmin, requireSession } from '../../../lib/api/apiUtils'
import prisma from '../../../lib/db'
import checkAllowedOrigins from '../../../util/checkAllowedOrigins'

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
        case 'DELETE':
            return handleDelete(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// DELETE /api/replies/[id]
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireSession(req, res))) return

    // only org admins can delete replies
    if (!(await requireOrgAdmin(req, res))) return

    const id = parseInt(req.query.id as string)

    await prisma.reply.delete({
        where: { id },
    })

    res.status(200)
}
