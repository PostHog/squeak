import Iron from '@hapi/iron'
import { User } from '@prisma/client'
import { IncomingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/nextjs'

import { NextApiRequestCookies } from 'next/dist/server/api-utils'

// export interface RequestWithCookies {
//     cookies: NextApiRequestCookies
// }

export type RequestWithCookies =
    | (NextApiRequest & { cookies: NextApiRequestCookies })
    | (IncomingMessage & { cookies: NextApiRequestCookies })

import prisma from '../db'

// import { User } from '@prisma/client'
import { MAX_AGE, setTokenCookie, getTokenCookie } from './cookies'
import { JWT_SECRET } from './jwt'

const TOKEN_SECRET = JWT_SECRET

export interface SessionData {
    user_id: string
    createdAt: number
    maxAge: number
}

export async function setLoginSession(res: NextApiResponse, userId: string) {
    const createdAt = Date.now()

    // Create a session object with a max age that we can validate later
    const obj = { user_id: userId, createdAt, maxAge: MAX_AGE }
    try {
        const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults)

        setTokenCookie(res, token)
    } catch (err) {
        Sentry.captureException(err)
        return
    }
}

export async function getLoginSession(req: RequestWithCookies): Promise<SessionData | undefined> {
    const token = getTokenCookie(req)

    if (!token) return

    try {
        const session: SessionData = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults)
        const expiresAt = session.createdAt + session.maxAge * 1000
        // Validate the expiration date of the session
        if (Date.now() > expiresAt) {
            throw new Error('Session expired')
        }

        return session
    } catch (err) {
        Sentry.captureException(err)
        return
    }
}

export type SafeUser = Pick<User, 'id' | 'email' | 'role'>

export async function getSessionUser(req: RequestWithCookies): Promise<SafeUser | null> {
    const session = await getLoginSession(req)
    if (!session) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user_id },

        select: {
            id: true,
            email: true,
            role: true,
        },
    })
    return user
}
