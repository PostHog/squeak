import { serialize, parse } from 'cookie'
import { NextApiResponse } from 'next'
import { RequestWithCookies } from './session'

export const TOKEN_NAME = 'squeak@@session'

export const MAX_AGE = 86400 * 30 // 30 days

// TODO: Should find a better way to disable in CI
const secure = process.env.NODE_ENV === 'production' && process.env.API_DOMAIN !== 'http://localhost:3000'

export function setTokenCookie(res: NextApiResponse, token: string) {
    const cookie = serialize(TOKEN_NAME, token, {
        maxAge: MAX_AGE,
        expires: new Date(Date.now() + MAX_AGE * 1000),
        httpOnly: true,
        secure,
        path: '/',
        sameSite: secure ? 'none' : 'lax',
    })

    res.setHeader('Set-Cookie', cookie)
}

export function removeTokenCookie(res: NextApiResponse) {
    const cookie = serialize(TOKEN_NAME, '', {
        maxAge: -1,
        path: '/',
        httpOnly: true,
        secure,
        sameSite: secure ? 'none' : 'lax',
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
