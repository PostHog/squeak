import { NextApiRequest, NextApiResponse } from 'next'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'

export async function allowedOrigin(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    next()
}
