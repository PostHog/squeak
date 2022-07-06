import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Checks either request query params or the json request body for the presence of a list of parameters. If those don't exist, this method returns false and sends a 400 response.
 * @param  {string[]} params
 * @param  {NextApiRequest} req
 * @param  {NextApiResponse} res
 * @returns boolean
 */
export function checkRequiredParams(params: string[], req: NextApiRequest, res: NextApiResponse): boolean {
    if (req.method === 'GET') {
        params.forEach((param) => {
            if (!req.query[param] || req.query[param] === '') {
                res.status(400).json({ error: `Required param '${param}' is not present.` })
                return false
            }
        })
    } else {
        const body = JSON.parse(req.body)
        params.forEach((param) => {
            if (!body[param] || body[param] === '') {
                res.status(400).json({ error: `Required param '${param}' is not present.` })
                return false
            }
        })
    }

    return true
}

export function methodNotAllowed(res: NextApiResponse): void {
    res.status(405).json({ error: 'Method not allowed' })
}

export function notAuthenticated(res: NextApiResponse): void {
    res.status(401).json({ error: 'Not authenticated' })
}

export function orgIdNotFound(res: NextApiResponse): void {
    res.status(400).json({ error: 'Organization ID not found' })
}
