import type { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'

type UserProfileReadonly = definitions['squeak_profiles_readonly']

interface Result {
    data?: UserProfileReadonly
    error?: Error
}

const createUserProfileReadonly = async (
    userId: string,
    organizationId: string,
    profileId: string,
    role = 'user'
): Promise<Result> => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    // Create readonly profile
    const { data, error } = await supabaseServiceRoleClient
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .insert({
            role,
            user_id: userId,
            organization_id: organizationId,
            profile_id: profileId,
        })
        .limit(1)
        .single()

    if (!data || error) {
        return { error: new Error(error?.message ?? 'Failed to create readonly profile') }
    }

    return { data }
}

export default createUserProfileReadonly
