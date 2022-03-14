import { NextPageWithLayout } from '../@types/types'
import { ReactElement, useEffect, useState } from 'react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'
import { definitions } from '../@types/supabase'
import withAdminAccess from '../util/withAdminAccess'
import { GetStaticPropsResult } from 'next'
import InviteUser from '../components/InviteUser'

type UserProfileView = definitions['squeak_profiles_view']

interface Props {}

const Users: NextPageWithLayout<Props> = () => {
    const [profiles, setProfiles] = useState<Array<UserProfileView>>([])

    const fetchProfiles = async () => {
        const { data } = await supabaseClient
            .from<UserProfileView>('squeak_profiles_view')
            .select(`id, first_name, last_name, avatar, role`)

        // TODO(JS): Handle errors here

        setProfiles(data ?? [])
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

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
    return <AdminLayout title="Profiles">{page}</AdminLayout>
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
