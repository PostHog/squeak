import { NextApiRequest, NextApiResponse } from 'next'
import absoluteUrl from 'next-absolute-url'
import nextConnect from 'next-connect'
import { Prisma } from '@prisma/client'

import createUserProfile from '../../util/createUserProfile'
import createUserProfileReadonly from '../../util/createUserProfileReadonly'
import { sendUserConfirmation } from '../../lib/email'
import { createUser, UserRoles } from '../../db'
import { allowedOrigin, corsMiddleware } from '../../lib/middleware'
import { setLoginSession } from '../../lib/auth'

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
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    try {
        const user = await createUser(email, password, UserRoles.authenticated)
        if (!user) {
            console.error(`[🧵 Register] Error fetching user profile`)
            res.status(500).json({ error: 'User creating user' })

            return
        }

        const { data: userProfile, error: userProfileError } = await createUserProfile({
            first_name: firstName,
            last_name: lastName,
            avatar,
        })

        if (!userProfile || userProfileError) {
            console.error(`[🧵 Register] Error creating user profile`)

            res.status(500)

            if (userProfileError) {
                console.error(`[🧵 Register] ${userProfileError.message}`)

                res.json({ error: userProfileError.message })
            }

            return
        }

        const { data: userProfileReadonly, error: userProfileReadonlyError } = await createUserProfileReadonly(
            user.id,
            organizationId,
            userProfile.id,
            'user'
        )

        if (!userProfileReadonly || userProfileReadonlyError) {
            console.error(`[🧵 Register] Error creating user readonly profile`)

            res.status(500).json({ error: 'Error creating user readonly profile' })

            if (userProfileReadonlyError) {
                console.error(`[🧵 Register] ${userProfileReadonlyError.message}`)

                res.json({ error: userProfileReadonlyError.message })
            }

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
        await setLoginSession(res, user.id)
        await sendUserConfirmation(organizationId, user, confirmationUrl)

        res.status(200).json(response)
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return res.status(422).json({ error: 'Email address is already taken' })
            }
        }
        res.status(500).json({ error: 'An unexpected error occurred' })
    }
}

export default handler
