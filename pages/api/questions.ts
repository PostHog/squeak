import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import getQuestions from '../../util/getQuestions'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'
import { methodNotAllowed } from '../../lib/api/apiUtils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
        case 'POST': // the fact that this is a POST is legacy in the client sdk
        case 'GET': // add GET support to eventually deprecate the 'POST' method to fetch questions
            return fetchQuestions(req, res)
        default:
            return methodNotAllowed(res)
    }
}

// POST /api/questions
// Fetch a list of questions
async function fetchQuestions(req: NextApiRequest, res: NextApiResponse) {
    const params = JSON.parse(req.body)
    const { data } = await getQuestions({ req, res }, params)

    res.status(200).json(data)
}

export default handler
