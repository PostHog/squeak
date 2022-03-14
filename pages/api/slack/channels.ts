import { NextApiRequest, NextApiResponse } from 'next'

/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */

const channels = async (req: NextApiRequest, res: NextApiResponse) => {
    const { token } = JSON.parse(req.body)
    const client = new WebClient(token)

    try {
        const result = await client.conversations.list()
        res.status(200).json(result.channels)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
}

export default channels
