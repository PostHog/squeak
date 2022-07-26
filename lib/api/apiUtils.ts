import { NextApiRequest, NextApiResponse } from 'next'
import { Session, unstable_getServerSession } from 'next-auth'
import superjson from 'superjson'

import getActiveOrganization from '../../util/getActiveOrganization'
import { authOptions } from '../../pages/api/auth/[...nextauth]'
import { getReadonlyProfileForUser } from '../../db'
import { getSessionUser } from '../auth'
import { User } from '@prisma/client'

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
        const body = req.body
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

export function notAuthorized(res: NextApiResponse): void {
    res.status(403).json({ error: 'Not authorized' })
}

export function orgIdNotFound(res: NextApiResponse): void {
    res.status(400).json({ error: 'Organization ID not found' })
}

export function objectNotFound(res: NextApiResponse): void {
    res.status(404).json({ error: 'Object not found' })
}

// Determines whether the current user is an admin of the "current" organization, which is determined by the organization ID stored in the cookie
export async function isAdmin(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
    const user = await getSessionUser(req)
    const organizationId = getActiveOrganization({ req })

    if (!user) {
        notAuthenticated(res)
        return false
    }

    if (!user || !organizationId) {
        return false
    }

    const readonlyProfile = await getReadonlyProfileForUser(user.id, organizationId)
    if (!readonlyProfile) return false

    return readonlyProfile.role === 'admin'
}

export async function requireSession(req: NextApiRequest, res: NextApiResponse): Promise<User | undefined> {
    const user = await getSessionUser(req)
    if (!user) {
        notAuthenticated(res)
        return
    }
    return user
}

/**
 * Responds with 403 if user is not an admin. Responds with 401 if user is not authenticated.
 * @param  {NextApiRequest} req
 * @param  {NextApiResponse} res
 */
export async function requireOrgAdmin(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireSession(req, res))) return

    const admin = await isAdmin(req, res)
    if (!admin) {
        notAuthorized(res)
        return false
    }

    return true
}

export async function getServerSession(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
    return await unstable_getServerSession(req, res, authOptions)
}

export function safeJson(res: NextApiResponse, data: any, statusCode?: number) {
    const { json } = superjson.serialize(data)
    res.status(statusCode || 200)
        .setHeader('Content-Type', 'application/json')
        .send(json)
}
