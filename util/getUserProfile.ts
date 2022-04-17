import { User } from '@supabase/gotrue-js'
import type { GetServerSidePropsContext, NextApiResponse } from 'next'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { NextApiRequest } from 'next'
import createUserProfile from './createUserProfile'
import createUserProfileReadonly from './createUserProfileReadonly'

type UserProfile = definitions['squeak_profiles']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
          res: NextApiResponse
      }

interface Args {
    organizationId: string
    context: Context
    user?: User
    token?: string
}

interface Result {
    data?: UserProfile | null
    error?: Error
}

const lookupUserProfile = async (context: Context, user: User, organizationId: string): Promise<Result> => {
    const { data: userProfileReadonly, error: userProfileReadonlyError } = await supabaseServerClient(context)
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .select('profile_id')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .limit(1)

    if (userProfileReadonlyError) {
        return { error: new Error(userProfileReadonlyError.message) }
    }

    // If the user does not have a profile, they likely have one for another org, but not this one, so we'll create one
    // for this org.
    if (!userProfileReadonly || userProfileReadonly.length === 0) {
        // Get an existing profile from another org
        const { data: existingProfile, error: existingProfileError } = await supabaseServerClient(context)
            .from('squeak_profiles_readonly')
            .select('id, profile:squeak_profiles(first_name, last_name)')
            .limit(1)
            .single()

        if (!existingProfile || existingProfileError) {
            return { error: new Error(existingProfileError?.message ?? 'User has no profile in any organization') }
        }

        // Create profile
        const { data: createdProfile, error: createdProfileError } = await createUserProfile(
            existingProfile.profile.first_name,
            existingProfile.profile.last_name
        )

        if (!createdProfile || createdProfileError) {
            return { error: new Error(createdProfileError?.message ?? 'Failed to create profile') }
        }

        const { data: createdProfileReadonly, error: createdProfileReadonlyError } = await createUserProfileReadonly(
            user.id,
            organizationId,
            createdProfile.id,
            'user'
        )

        if (!createdProfileReadonly || createdProfileReadonlyError) {
            return { error: new Error(createdProfileReadonlyError?.message ?? 'Failed to create readonly profile') }
        }

        return { data: createdProfile }
    }

    const [{ profile_id }] = userProfileReadonly
    const { data: userProfile, error: userProfileError } = await supabaseServerClient(context)
        .from<UserProfile>('squeak_profiles')
        .select('*')
        .eq('id', profile_id)
        .limit(1)
        .single()

    if (userProfileError) {
        return { error: new Error(userProfileError.message) }
    }

    return { data: userProfile }
}

const getUserProfile = async (args: Args): Promise<Result> => {
    const { organizationId, context, user, token } = args

    if (user) {
        return lookupUserProfile(context, user, organizationId)
    }

    if (token) {
        const { user } = await supabaseServerClient(context).auth.api.getUser(token)

        if (!user) {
            return { error: new Error('User not found for token') }
        }

        return lookupUserProfile(context, user, organizationId)
    }

    throw new Error('Must provide either a user or a token')
}

export default getUserProfile
