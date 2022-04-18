import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { GetStaticPropsResult } from 'next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { definitions } from '../@types/supabase'
import { NextPageWithLayout } from '../@types/types'
import InviteUser from '../components/InviteUser'
import useActiveOrganization from '../hooks/useActiveOrganization'
import { useToasts } from 'react-toast-notifications'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'
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
            <div className="flex space-between items-center">
                <p className="pb-4 flex-1">This lists all users in your database.</p>
                <InviteUser
                    className="mb-6"
                    onInvite={() => {
                        fetchProfiles()
                    }}
                />
            </div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <ProfileTable profiles={profiles} />
            </div>
        </>
    )
}

Users.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Profiles">
            {page}

            <p className="pt-4">
                <strong>Users</strong> can ask questions and post responses <br />
                <strong>Moderators</strong> can sign in here to manage/remove questions/replies <br />
                <strong>Admins</strong> can administer user roles
            </p>
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
