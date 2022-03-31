import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { definitions } from '../@types/supabase'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { parseCookies, setCookie } from 'nookies'

type UserProfileReadonly = definitions['squeak_profiles_readonly']

const useActiveOrganization = () => {
    const { user } = useUser()

    const setActiveOrganization = async (organizationId?: number) => {
        if (organizationId) {
            setCookie(null, 'squeak_organization_id', `${organizationId}`, { path: '/' })
            return
        }

        // Get the users organizations, and set the first one as the active organization (as a cookie)
        // TODO(JS): In the future, we may want to allow the user to select which organization they want to use upon login
        const { data: organizations } = await supabaseClient
            .from<UserProfileReadonly>('squeak_profiles_readonly')
            .select('organisation_id')
            .eq('user_id', user?.id)

        if (!organizations) {
            return
        }

        const [organisation] = organizations

        setCookie(null, 'squeak_organization_id', `${organisation.organisation_id}`, { path: '/' })
    }

    const getActiveOrganization = () => {
        const { squeak_organization_id } = parseCookies()

        return squeak_organization_id
    }

    return {
        setActiveOrganization,
        getActiveOrganization,
    }
}

export default useActiveOrganization
