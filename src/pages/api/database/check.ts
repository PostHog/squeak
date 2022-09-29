import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db'
import withPreflightCheck from '../../../util/withPreflightCheck'

export default withPreflightCheck(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await prisma.question.findFirst()
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(500).json({ error: 'An error occurred' })
    }
})
