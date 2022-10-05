import prisma from '../lib/db'
import createUserProfile from '../util/createUserProfile'

export function getUserRole(organizationId: string, userId: string) {
    return prisma.profile.findFirst({
        where: {
            organization_id: organizationId,
            user_id: userId,
        },
        select: { role: true },
    })
}

export interface CreateProfileParams {
    first_name?: string
    last_name?: string
    avatar?: string
    slack_user_id?: string
    organization_id: string
}

/**
 * Find a Profile for a slack user, or create one, and return the profileId
 * @param  {CreateProfileParams} params
 */
export async function findOrCreateProfileFromSlackUser(params: CreateProfileParams) {
    const { slack_user_id, first_name, last_name, avatar, organization_id } = params
    const data = await prisma.profile.findFirst({
        where: { slack_user_id },
        select: { id: true },
    })

    if (data?.id) {
        return data.id
    }

    // Create a new profile for the slack user
    const { data: profile } = await createUserProfile({
        first_name,
        last_name,
        avatar,
        organization_id,
        slack_user_id,
        role: 'user',
    })

    return profile?.id
}
