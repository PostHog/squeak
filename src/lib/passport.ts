import passport from 'passport'
import Local from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'

import { verifyUserCredentials } from '../db'
import prisma from './db'

if (!process.env.JWT_SECRET) {
    throw 'No JWT_SECRET found in environment'
}

passport.use(
    new Local.Strategy({ usernameField: 'email', session: false }, async (email: string, password: string, done) => {
        const user = await verifyUserCredentials(email, password)
        done(null, user)
    })
)

passport.use(
    new JWTStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromBodyField('token'),
            issuer: 'squeak.cloud',
            audience: 'authenticated',
            algorithms: ['HS256'],
        },
        async (jwtPayload: Record<string, string>, done: VerifiedCallback) => {
            const user = await prisma.user.findUnique({
                where: { id: jwtPayload.sub },
            })

            if (!user) {
                done(new Error(`Could not find user with ${jwtPayload.sub}`), false)
            } else {
                done(null, user)
            }
        }
    )
)

export default passport
