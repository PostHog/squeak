import type { NextApiRequest, NextApiResponse } from 'next'

import getQuestions, { GetQuestionsParams } from '../../util/getQuestions'
import { safeJson } from '../../lib/api/apiUtils'
import nextConnect from 'next-connect'
import { corsMiddleware, allowedOrigin } from '../../lib/middleware'

const handler = nextConnect
handler<NextApiRequest, NextApiResponse>()
    .use(corsMiddleware)
    .use(allowedOrigin)
    .post(fetchQuestions)
    .get(fetchQuestions)

// POST /api/questions
// Public API endpoint to fetch a list of questions
async function fetchQuestions(req: NextApiRequest, res: NextApiResponse) {
    const params = req.body as GetQuestionsParams

    const { data } = await getQuestions({ req, res }, params)

    safeJson(res, data)
}

export default handler
