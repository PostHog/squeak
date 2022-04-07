import { User } from '@supabase/gotrue-js'
import type { GetServerSidePropsContext, NextApiResponse } from 'next'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { NextApiRequest } from 'next'

type UserProfile = definitions['squeak_profiles']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
          res: NextApiResponse
      }

interface Args {
    organizationId: number
    context: Context
    user?: User
    token?: string
}

interface Result {
    data?: UserProfile | null
    error?: Error
}

const lookupUserProfile = async (context: Context, user: User, organizationId: number): Promise<Result> => {
    const { data: userProfileReadonly, error: userProfileReadonlyError } = await supabaseServerClient(context)
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .select('profile_id')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .limit(1)
        .single()

    if (userProfileReadonlyError) {
        return { error: new Error(userProfileReadonlyError.message) }
    }

    const { data: userProfile, error: userProfileError } = await supabaseServerClient(context)
        .from<UserProfile>('squeak_profiles')
        .select('*')
        .eq('id', userProfileReadonly?.profile_id)
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
