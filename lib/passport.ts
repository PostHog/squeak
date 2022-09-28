import passport from 'passport'
import Local from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'
import { Strategy as GitHubStrategy } from 'passport-github2'

import { JWT_SECRET } from './auth/jwt'
import { UserRoles, verifyUserCredentials } from '../db'
import prisma from './db'
import { randomUUID } from 'crypto'
import { AuthProvider } from '@prisma/client'

passport.use(
    new Local.Strategy({ usernameField: 'email', session: false }, async (email: string, password: string, done) => {
        const user = await verifyUserCredentials(email, password)
        done(null, user)
    })
)

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

            done(null, user)
        }
    )
)

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/api/auth/github/callback',
            },
            async (accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) => {
                const provider = await prisma.userSocialAuthProvider.findFirst({
                    where: {
                        provider_id: profile.id,
                        provider: AuthProvider.GITHUB,
                    },
                    include: {
                        user: true,
                    },
                })

                if (provider === null) {
                    const user = await prisma.user.create({
                        data: {
                            id: randomUUID(),
                            role: UserRoles.admin,
                            confirmation_token: randomUUID(),
                            confirmation_sent_at: new Date(),
                            auth_providers: {
                                create: {
                                    provider: AuthProvider.GITHUB,
                                    token: {
                                        accessToken,
                                        refreshToken,
                                    },
                                    provider_id: profile.id,
                                },
                            },
                        },
                    })

                    done(null, user)
                } else {
                    done(null, provider.user)
                }
            }
        )
    )
}

export default passport
