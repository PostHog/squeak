import { serialize, parse } from 'cookie'
import { IncomingMessage } from 'http'
import { NextApiResponse } from 'next'
import { RequestWithCookies } from './session'

export const TOKEN_NAME = 'squeak_session'

export const MAX_AGE = 86400 * 30 // 30 days

function cookieDomainFromOrigin(req: IncomingMessage) {
    const origin = req.headers.origin || 'squeak.cloud'
    return origin.replace(/^https?:\/\//, '').replace(/\:\d+$/, '')
}

export function setTokenCookie(res: NextApiResponse, token: string) {
    const domain = cookieDomainFromOrigin(res.req)

    const cookie = serialize(TOKEN_NAME, token, {
        maxAge: MAX_AGE,
        expires: new Date(Date.now() + MAX_AGE * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: domain,
    })

    res.setHeader('Set-Cookie', cookie)
}

export function removeTokenCookie(res: NextApiResponse) {
    const cookie = serialize(TOKEN_NAME, '', {
        maxAge: -1,
        path: '/',
    })

    res.setHeader('Set-Cookie', cookie)
}

export function parseCookies(req: RequestWithCookies) {
    // For API Routes we don't need to parse the cookies.
    if (req.cookies) return req.cookies
    // For pages we do need to parse the cookies.
    const cookie = req.headers?.cookie
    return parse(cookie || '')
}

export function getTokenCookie(req: RequestWithCookies) {
    const cookies = parseCookies(req)
    return cookies[TOKEN_NAME]
}
