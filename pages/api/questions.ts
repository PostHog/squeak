import type { NextApiRequest, NextApiResponse } from 'next'
import getQuestions from '../../util/getQuestions'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.body
    const { data, error } = await getQuestions({ req, res }, params)

    if (error) {
        res.status(500).json({ error: error.message })
    }

    res.status(200).json(data)
}

export default handler
