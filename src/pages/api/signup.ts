import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import { createUser, UserRoles } from '../../db'
import { setLoginSession } from '../../lib/auth'
import prisma from 'src/lib/db'

interface SignupRequestPayload {
    email: string
    password: string
}

export interface SignupResponsePayload {
    userId: string
}

// This API route is for user signup for a multi tenant application.
// It only handles email and password. Profile creation is handled by /api/user-setup
export default withMultiTenantCheck(async (req, res) => {
    try {
        const { email, password }: SignupRequestPayload = req.body

        if (!email || !password || email === '' || password === '') {
            res.status(400).json({ error: 'Missing required fields' })
            return
        }

        const user = await createUser(email, password)

        if (!user) {
            console.error(`[🧵 Signup] Error creating user`)

            res.status(400).json({ error: 'Error creating user' })

            return
        }

        const organization = await prisma.organization.create({
            data: {
                profiles: {
                    create: {
                        role: UserRoles.admin,
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                },
            },
            include: {
                profiles: {
                    select: {
                        id: true,
                    },
                },
            },
        })

        if (!organization) {
            console.error(`[🧵 Signup] Error creating organization`)

            res.status(400).json({ error: 'Error creating organization' })

            return
        }

        const [profile] = organization.profiles

        await setLoginSession(res, user.id, organization.id, profile.id)

        res.status(201).json({ userId: user.id })
    } catch (error) {
        console.error(error)

        res.status(403).json({ error: 'Something went wrong when creating your account.' })
    }
})
