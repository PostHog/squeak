import { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { getLoginSession, SessionData } from '../auth'
import { TOKEN_NAME } from '../auth/cookies'
import passport from '../passport'

function parseCookies(req: NextApiRequest) {
    // For API Routes we don't need to parse the cookies.
    if (req.cookies) return req.cookies

    // For pages we do need to parse the cookies.
    const cookie = req.headers?.cookie
    return parse(cookie || '')
}

interface SessionParams {
    name: string
    secret: string
    cookie: Record<string, string>
}

// export function session(params: SessionParams) {
//     const { name, secret, cookie: cookieOpts } = params

//     return async (req: NextApiRequest & { session: any }, res: NextApiResponse, next: () => void) => {
//         const cookies = parseCookies(req)
//         const token = cookies[name]
//         let unsealed = {}

//         if (token) {
//             try {
//                 // the cookie needs to be unsealed using the password `secret`
//                 unsealed = await getLoginSession(token, secret)
//             } catch (e) {
//                 // The cookie is invalid
//             }
//         }

//         req.session = unsealed

//         // We are proxying res.end to commit the session cookie
//         const oldEnd = res.end
//         res.end = async function resEndProxy(...args) {
//             if (res.finished || res.writableEnded || res.headersSent) return
//             if (cookieOpts.maxAge) {
//                 req.session.maxAge = cookieOpts.maxAge
//             }

//             const token = await createLoginSession(req.session, secret)

//             res.setHeader('Set-Cookie', serialize(name, token, cookieOpts))
//             oldEnd.apply(this, args)
//         }

//         next()
//     }
// }

const auth = nextConnect()
    .use(passport.initialize())
    .use(async (req: NextApiRequest & { session: any }, res: NextApiResponse, next: () => void) => {
        const cookies = parseCookies(req)
        const token = cookies[TOKEN_NAME]
        let unsealed: SessionData | object | undefined = {}

        if (token) {
            try {
                // the cookie needs to be unsealed using the password `secret`
                // unsealed = await getLoginSession(token, secret)
                unsealed = await getLoginSession(req)
            } catch (e) {
                // The cookie is invalid
            }
        }

        req.session = unsealed

        // We are proxying res.end to commit the session cookie
        const oldEnd = res.end
        // end(cb?: () => void): this;
        res.end()
        // res.end = () => {
        //     return
        // }

        // res.end = async function resEndProxy(...args) {
        //     if (res.finished || res.writableEnded || res.headersSent) return
        //     if (cookieOpts.maxAge) {
        //         req.session.maxAge = cookieOpts.maxAge
        //     }

        //     const token = await createLoginSession(req.session, secret)

        //     res.setHeader('Set-Cookie', serialize(name, token, cookieOpts))
        //     oldEnd.apply(this, args)
        // }

        next()
    })

export const jwt = passport.authenticate('jwt', { session: false })

export default auth
