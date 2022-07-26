import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

export function nextCors(req: NextApiRequest, res: NextApiResponse) {
    return NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: req.headers.origin,
        credentials: true,
    })
}

export async function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    await nextCors(req, res)

    next()
}
