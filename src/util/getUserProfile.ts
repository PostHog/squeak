import { Prisma, Profile as UserProfile, User } from '@prisma/client'
import { SafeUser } from '../lib/auth'

import prisma from '../lib/db'

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
            return {
                data: null,
                error: `User is not a member of this organization (id: ${organizationId})`,
            }
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
