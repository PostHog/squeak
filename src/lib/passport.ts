import passport from 'passport'
import Local from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'

import { JWT_SECRET } from './auth/jwt'
import { verifyUserCredentials } from '../db'
import prisma from './db'

// This file defines the two strategies used by passport to authenticate users:
// 1. LocalStrategy: Authenticates users using a username and password. This allows the user to sign in with
//    email and password. This strategy is used by the login page and POST /api/login endpoint.
// 2. JWTStrategy: Authenticates users using a JWT. This strategy is used by all other API endpoints.
//
// Note: We do not use traditional cookie sessions, only JWTs.

// 1. Configure the local strategy
passport.use(
    new Local.Strategy({ usernameField: 'email', session: false }, async (email: string, password: string, done) => {
        const user = await verifyUserCredentials(email, password)
        done(null, user)
    })
)

// 2. Configure the JWT strategy
passport.use(
    new JWTStrategy(
        {
            secretOrKey: JWT_SECRET,
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
