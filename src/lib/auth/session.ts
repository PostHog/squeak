import Iron from '@hapi/iron'
import { User } from '@prisma/client'
import { IncomingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/nextjs'

import { NextApiRequestCookies } from 'next/dist/server/api-utils'

export type RequestWithCookies =
    | (NextApiRequest & { cookies: NextApiRequestCookies })
    | (IncomingMessage & { cookies: NextApiRequestCookies })

import prisma from '../db'

import { MAX_AGE, setTokenCookie, getTokenCookie } from './cookies'

export interface SessionData {
    user_id: string
    createdAt: number
    maxAge: number
}

export async function setLoginSession(res: NextApiResponse, userId: string) {
    if (!process.env.JWT_SECRET) {
        throw 'No JWT_SECRET found in environment'
    }

    const createdAt = Date.now()

    // Create a session object with a max age that we can validate later
    const obj = { user_id: userId, createdAt, maxAge: MAX_AGE }
    try {
        const token = await Iron.seal(obj, process.env.JWT_SECRET, Iron.defaults)

        setTokenCookie(res, token)
    } catch (err) {
        Sentry.captureException(err)
        return
    }
}

export async function getLoginSession(req: RequestWithCookies): Promise<SessionData | undefined> {
    if (!process.env.JWT_SECRET) {
        throw 'No JWT_SECRET found in environment'
    }

    const token = getTokenCookie(req)

    if (!token) return

    try {
        const session: SessionData = await Iron.unseal(token, process.env.JWT_SECRET, Iron.defaults)
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
