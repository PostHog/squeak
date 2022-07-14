import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    switch (req.method) {
        case 'POST':
            return await handleCreate(req, res)

        default:
            break
    }
}
