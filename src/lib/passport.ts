import passport from 'passport'
import Local from 'passport-local'
import OAuth2Strategy from 'passport-oauth2'
import { Octokit } from 'octokit'

import { verifyUserCredentials } from '../db'
import prisma from './db'
import { randomUUID } from 'crypto'
import { Provider } from '@prisma/client'

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
            async (req, accessToken, _refreshToken, _, cb) => {
                console.log(JSON.stringify(req.query))
                console.log(req.query)
                const octokit = new Octokit({
                    auth: accessToken,
                })

                const profile = await octokit.request('GET /user', {})
                const emails = await octokit.request('GET /user/emails')

                const primaryEmail = emails.data.find((email) => email.primary)

                if (!primaryEmail) {
                    cb('User does not have a primary email address', null)
                    return
                }

                let user = await prisma.user.upsert({
                    where: {
                        email: primaryEmail.email,
                    },
                    update: {
                        auth_providers: {
                            create: {
                                id: randomUUID(),
                                oid: profile.data.id.toString(),
                                provider: Provider.GITHUB,
                                token: accessToken,
                                scopes: ['user:email'],
                            },
                        },
                    },
                    create: {
                        id: randomUUID(),
                        email: primaryEmail.email,
                        auth_providers: {
                            create: {
                                id: randomUUID(),
                                oid: profile.data.id.toString(),
                                provider: Provider.GITHUB,
                                token: accessToken,
                                scopes: ['user:email'],
                            },
                        },
                    },
                    include: {
                        auth_providers: false,
                    },
                })

                cb(null, user)
            }
        )
    )
}

export default passport
