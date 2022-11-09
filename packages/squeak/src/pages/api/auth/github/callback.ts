import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { VerifyCallback } from 'passport-oauth2'
import { SafeUser, setLoginSession } from 'src/lib/auth'
import prisma from 'src/lib/db'

import passport from 'src/lib/passport'

const handler = nextConnect<NextApiRequest, NextApiResponse>({})
    .use(async (req, res, next) => {
        const controlHeaders = req.headers['access-control-request-headers'] || ''

        res.setHeader('Access-Control-Allow-Headers', controlHeaders)
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE')
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
        res.setHeader('Access-Control-Allow-Credentials', 'true')

        if (req.method === 'OPTIONS') {
            res.status(200)
            res.end()
        }

        next()
    })
    .use(passport.initialize())
    .get((req, res, next) => {
        const handleAuth = async (err: Error | null | undefined, user: SafeUser | undefined, info: any) => {
            if (err) {
                console.error(err)
                res.redirect('/login')
                return
            }

            if (!user) {
                res.redirect(`/login${info.message ? '?message=' + encodeURIComponent(info.message) : ''}`)
                return
            }

            const profile = await prisma.profile.findFirst({
                where: { user_id: user.id },
                select: {
                    id: true,
                    organization_id: true,
                },
            })

            if (!profile || !profile.organization_id) return res.redirect('/signup')

            const orgId = profile.organization_id
            const profileId = profile.id

            await setLoginSession(res, user.id, orgId, profileId)

            return res.redirect(info.redirect || '/')
        }

        passport.authenticate('github', { failureRedirect: '/login', session: false, failWithError: true }, handleAuth)(
            req,
            res,
            next
        )
    })

export default handler
