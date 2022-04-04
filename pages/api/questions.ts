import type { NextApiRequest, NextApiResponse } from 'next'
import getQuestions from '../../util/getQuestions'
import NextCors from 'nextjs-cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const params = req.body
    const { data, error } = await getQuestions({ req, res }, params)

    if (error) {
        res.status(500).json({ error: error.message })
    }

    res.status(200).json(data)
}

export default handler
