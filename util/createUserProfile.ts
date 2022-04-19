import type { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'

type UserProfile = definitions['squeak_profiles']

interface Result {
    data?: UserProfile
    error?: Error
}

const createUserProfile = async (first_name?: string, last_name?: string, avatar?: string): Promise<Result> => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabaseServiceRoleClient
        .from<UserProfile>('squeak_profiles')
        .insert({
            first_name: first_name,
            last_name: last_name,
            avatar,
        })
        .limit(1)
        .single()

    if (!data || error) {
        return { error: new Error(error?.message ?? 'Failed to create profile') }
    }

    return { data }
}

export default createUserProfile
