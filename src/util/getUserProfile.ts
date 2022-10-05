import { Prisma, Profile as UserProfile, User } from '@prisma/client'
import { SafeUser } from '../lib/auth'

import prisma from '../lib/db'
import createUserProfile from './createUserProfile'

interface Result {
    data?: UserProfile | null
    error?: Error | string
}

async function lookupUserProfile(user: Pick<User, 'id'>, organizationId: string): Promise<Result> {
    try {
        const userProfile = await prisma.profile.findFirst({
            where: {
                user_id: user.id,
                organization_id: organizationId,
            },
        })

        // If the user does not have a profile, they likely have one for another org, but not this one, so we'll create one
        // for this org.
        if (!userProfile) {
            // Get an existing profile from another org
            const existingProfile = await prisma.profile.findFirst({
                where: { user_id: user.id },
            })

            if (!existingProfile) {
                return { error: new Error('User has no profile in any organization') }
            }

            // Create profile for this org
            const { data: createdProfile, error: createdProfileError } = await createUserProfile({
                first_name: existingProfile.first_name,
                last_name: existingProfile.last_name,
                avatar: existingProfile.avatar,
                user_id: user.id,
                organization_id: organizationId,
                role: 'user',
            })

            if (!createdProfile || createdProfileError) {
                return { error: new Error(createdProfileError?.message ?? 'Failed to create profile') }
            }

            return { data: createdProfile }
        }

        return { data: userProfile }
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return { error: new Error(err.message) }
        }
        return { error: 'unexpected error' }
    }
}

interface Args {
    organizationId: string
    user: User | SafeUser | null
}

const getUserProfile = async (args: Args): Promise<Result> => {
    const { organizationId, user } = args

    if (user) {
        return lookupUserProfile(user, organizationId)
    }

    throw new Error('Must provide either a user or a token')
}

export default getUserProfile
