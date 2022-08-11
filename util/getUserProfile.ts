import { Prisma, Profile as UserProfile, User } from '@prisma/client'
import { SafeUser } from '../lib/auth'

import prisma from '../lib/db'
import createUserProfile from './createUserProfile'
import createUserProfileReadonly from './createUserProfileReadonly'

interface Result {
    data?: UserProfile | null
    error?: Error | string
}

async function lookupUserProfile(user: Pick<User, 'id'>, organizationId: string): Promise<Result> {
    try {
        const userProfileReadonly = await prisma.profileReadonly.findFirst({
            select: { profile_id: true },
            where: {
                user_id: user.id,
                organization_id: organizationId,
            },
        })

        // If the user does not have a profile, they likely have one for another org, but not this one, so we'll create one
        // for this org.
        if (!userProfileReadonly) {
            // Get an existing profile from another org
            const existingProfile = await prisma.profileReadonly.findFirst({
                where: { user_id: user.id },
                include: { profile: true },
            })

            if (!existingProfile) {
                return { error: new Error('User has no profile in any organization') }
            }

            // Create profile for this org
            const { data: createdProfile, error: createdProfileError } = await createUserProfile({
                first_name: existingProfile.profile.first_name,
                last_name: existingProfile.profile.last_name,
                avatar: existingProfile.profile.avatar,
            })

            if (!createdProfile || createdProfileError) {
                return { error: new Error(createdProfileError?.message ?? 'Failed to create profile') }
            }

            // Create readonly profile
            const { data: createdProfileReadonly, error: createdProfileReadonlyError } =
                await createUserProfileReadonly(user.id, organizationId, createdProfile.id, 'user')

            if (!createdProfileReadonly || createdProfileReadonlyError) {
                return { error: new Error(createdProfileReadonlyError?.message ?? 'Failed to create readonly profile') }
            }

            return { data: createdProfile }
        }

        const { profile_id } = userProfileReadonly

        try {
            const userProfile = await prisma.profile.findUnique({ where: { id: profile_id } })
            if (!userProfile) {
                return { error: new Error(`User profile '${profile_id}' not found`) }
            }

            return { data: userProfile }
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                return { error: new Error(err.message) }
            }
        }
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return { error: new Error(err.message) }
        }
        return { error: 'unexpected error' }
    }

    return { error: 'Unexpected error' }
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
