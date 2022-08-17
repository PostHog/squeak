import { NextApiRequest, NextApiResponse } from 'next'

/* eslint-disable @typescript-eslint/no-var-requires */
const { WebClient } = require('@slack/web-api')
/* eslint-enable @typescript-eslint/no-var-requires */

const channels = async (req: NextApiRequest, res: NextApiResponse) => {
    const { token } = req.body
    const client = new WebClient(token)

    if (!token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    try {
        const result = await client.conversations.list()
        res.status(200).json(result.channels)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
}

export default channels
