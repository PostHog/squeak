import { createClient } from '@supabase/supabase-js'
import type { definitions } from '../@types/supabase'

type UserProfileReadonly = definitions['squeak_profiles_readonly']

interface Result {
    data?: UserProfileReadonly
    error?: Error
}

const createUserProfileReadonly = async (
    userId: string | null,
    organizationId: string,
    profileId: string,
    role = 'user',
    slack_user_id?: string
): Promise<Result> => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Create readonly profile
    const { data, error } = await supabaseServiceRoleClient
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .insert({
            role,
            user_id: userId || undefined,
            organization_id: organizationId,
            profile_id: profileId,
            slack_user_id,
        })
        .limit(1)
        .single()

    if (!data || error) {
        return { error: new Error(error?.message ?? 'Failed to create readonly profile') }
    }

    return { data }
}

export default createUserProfileReadonly
