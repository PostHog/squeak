import passport from 'passport'
import Local from 'passport-local'
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2'
import { Octokit } from 'octokit'

import { UserRoles, verifyUserCredentials } from '../db'
import prisma from './db'
import { randomUUID } from 'crypto'
import { Provider } from '@prisma/client'
import { OAuthState } from './auth'

if (!process.env.JWT_SECRET) {
    throw 'No JWT_SECRET found in environment'
}

passport.use(
    new Local.Strategy({ usernameField: 'email', session: false }, async (email: string, password: string, done) => {
        const user = await verifyUserCredentials(email, password)
        done(null, user)
    })
)

if (process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CLIENT_ID) {
    passport.use(
        'github',
        new OAuth2Strategy(
            {
                authorizationURL: 'https://github.com/login/oauth/authorize',
                tokenURL: 'https://github.com/login/oauth/access_token',
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/api/auth/github/callback',
                passReqToCallback: true,
            },
            async (req, accessToken, _refreshToken, _profile, cb: VerifyCallback) => {
                try {
                    const { action, redirect, organizationId } = JSON.parse(req.query.state) as OAuthState

                    const octokit = new Octokit({
                        auth: accessToken,
                    })

                    const profile = await octokit.request('GET /user')
                    const emails = await octokit.request('GET /user/emails')

                    const primaryEmail = emails.data.find((email) => email.primary)

                    if (!primaryEmail) {
                        cb(new Error('User does not have a primary email address'), undefined)
                        return
                    }

                    const [user] = await prisma.$transaction([
                        prisma.user.upsert({
                            where: {
                                email: primaryEmail.email,
                            },
                            create: {
                                id: randomUUID(),
                                email: primaryEmail.email,
                                email_confirmed_at: new Date(),
                                auth_providers: {
                                    connectOrCreate: {
                                        where: {
                                            id_provider: {
                                                id: profile.data.id.toString(),
                                                provider: Provider.GITHUB,
                                            },
                                        },
                                        create: {
                                            id: profile.data.id.toString(),
                                            provider: Provider.GITHUB,
                                            token: accessToken,
                                            scopes: ['user:email'],
                                        },
                                    },
                                },
                            },
                            update: {
                                auth_providers: {
                                    connectOrCreate: {
                                        where: {
                                            id_provider: {
                                                id: profile.data.id.toString(),
                                                provider: Provider.GITHUB,
                                            },
                                        },
                                        create: {
                                            id: profile.data.id.toString(),
                                            provider: Provider.GITHUB,
                                            token: accessToken,
                                            scopes: ['user:email'],
                                        },
                                    },
                                },
                            },
                            include: {
                                auth_providers: true,
                                profiles: true,
                            },
                        }),
                    ])

                    if (organizationId) {
                        await prisma.profile.upsert({
                            where: {
                                user_id_organization_id: {
                                    organization_id: organizationId,
                                    user_id: user.id,
                                },
                            },
                            create: {
                                user_id: user.id,
                                organization_id: organizationId,
                                role: UserRoles.user,
                            },
                            update: {},
                        })

                        cb(null, user)
                    } else {
                        if (action === 'login' && user.profiles.length === 0) {
                            cb(null, undefined, {
                                message:
                                    "It looks like there isn't an account associated with that email. Try logging in from the Q&A widget instead or signing-up for a new account.",
                            })
                        } else if (action === 'signup') {
                            const org = await prisma.organization.create({
                                data: {
                                    id: randomUUID(),
                                    profiles: {
                                        create: {
                                            role: UserRoles.admin,
                                            user_id: user.id,
                                        },
                                    },
                                },
                            })

                            cb(null, user, { redirect })
                        } else if (user) {
                            console.log('test')
                            cb(null, user, { redirect })
                        } else {
                            throw 'Unsupported action'
                        }
                    }
                } catch (error) {
                    console.error(error)
                    // cb(new Error('Something went wrong'), undefined)
                }
            }
        )
    )
}

export default passport
