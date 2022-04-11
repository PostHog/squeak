import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { GetStaticPropsResult } from 'next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { definitions } from '../@types/supabase'
import { NextPageWithLayout } from '../@types/types'
import InviteUser from '../components/InviteUser'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'
import useActiveOrganization from '../util/useActiveOrganization'
import withAdminAccess from '../util/withAdminAccess'

type UserProfileView = definitions['squeak_profiles_view']

interface Props {}

const Users: NextPageWithLayout<Props> = () => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const [profiles, setProfiles] = useState<Array<UserProfileView>>([])

    const organizationId = getActiveOrganization()

    const fetchProfiles = useCallback(async () => {
        const { data, error } = await supabaseClient
            .from<UserProfileView>('squeak_profiles_view')
            .select(`profile_id, user_id, first_name, last_name, avatar, role`)
            .eq('organization_id', organizationId)

        if (error) {
            addToast(error.message, { appearance: 'error', autoDismiss: true })
        }

        setProfiles(data ?? [])
    }, [addToast, organizationId])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    return (
        <>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <ProfileTable profiles={profiles} />
            </div>
            <InviteUser
                className="mt-6 float-right"
                onInvite={() => {
                    fetchProfiles()
                }}
            />
        </>
    )
}

Users.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Profiles">
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Users
