import { ProfileReadonly } from '@prisma/client'
import prisma from '../lib/db'

interface Result {
    data?: ProfileReadonly
    error?: Error
}

const createUserProfileReadonly = async (
    userId: string | null,
    organizationId: string,
    profileId: string,
    role = 'user',
    slack_user_id?: string
): Promise<Result> => {
    try {
        const data = await prisma.profileReadonly.create({
            data: {
                role,
                user_id: userId,
                organization_id: organizationId,
                profile_id: profileId,
                slack_user_id,
            },
        })
        if (!data) return { error: new Error('Failed to create readonly profile') }
        return { data }
    } catch (err) {
        return { error: new Error('Failed to create readonly profile') }
    }
}

export default createUserProfileReadonly
