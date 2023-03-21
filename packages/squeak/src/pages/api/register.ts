import { NextApiRequest, NextApiResponse } from 'next'
import absoluteUrl from 'next-absolute-url'
import nextConnect from 'next-connect'
import { Prisma } from '@prisma/client'

import { sendUserConfirmation } from '../../lib/email'
import { createUser, UserRoles } from '../../db'
import { allowedOrigin, corsMiddleware } from '../../lib/middleware'
import { setLoginSession } from '../../lib/auth'
import prisma from 'src/lib/db'

export interface RegisterUserResponse {
    userId: string
    profileId: string
    firstName: string
    lastName: string
    avatar: string
    organizationId: string
}

const handler = nextConnect<NextApiRequest, NextApiResponse>().use(corsMiddleware).use(allowedOrigin).post(handlePost)

// This API route is for registering a new user from the JS snippet.
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { organizationId, firstName, lastName, email, password, avatar } = req.body

    if (!organizationId) {
        res.status(400).json({ error: 'Missing required field `organizationId`' })
        return
    }

    try {
        const user = await createUser(email, password)

        if (!user) {
            console.error(`[🧵 Register] Error fetching user profile`)
            res.status(500).json({ error: 'User creating user' })

            return
        }

        const userProfile = await prisma.profile.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                avatar,
                user_id: user.id,
                organization_id: organizationId,
                role: UserRoles.user,
            },
        })

        if (!userProfile) {
            console.error(`[🧵 Register] Error creating user profile`)

            res.status(500)

            return
        }

        const response: RegisterUserResponse = {
            userId: user.id,
            profileId: userProfile.id,
            firstName,
            lastName,
            avatar,
            organizationId: organizationId,
        }

        const { origin } = absoluteUrl(req)
        const redirectUrl = `${origin}/profile`
        const confirmationUrl = `${origin}/api/user/confirm?token=${user.confirmation_token}&redirect=${redirectUrl}`

        await setLoginSession(res, user.id, organizationId, userProfile.id)
        // await sendUserConfirmation(organizationId, user, confirmationUrl)

        res.status(200).json(response)
    } catch (e) {
        console.error(e)

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return res.status(422).json({ error: 'Email address is already taken' })
            }
        }
        res.status(500).json({ error: 'An unexpected error occurred' })
    }
}

export default handler
