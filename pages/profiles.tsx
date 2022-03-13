import { NextPageWithLayout } from '../@types/types'
import { ReactElement, useEffect, useState } from 'react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'
import { definitions } from '../@types/supabase'
import withAdminAccess from '../util/withAdminAccess'
import { GetStaticPropsResult } from 'next'

type UserProfileView = definitions['squeak_profiles_view']

interface Props {}

const Users: NextPageWithLayout<Props> = () => {
    const [profiles, setProfiles] = useState<Array<UserProfileView>>([])

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data } = await supabaseClient
                .from<UserProfileView>('squeak_profiles_view')
                .select(`id, first_name, last_name, avatar, role`)

            // TODO(JS): Handle errors here

            setProfiles(data ?? [])
        }

        fetchProfiles()
    }, [])

    return (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <ProfileTable profiles={profiles} />
        </div>
    )
}

Users.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout title="Users">{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess<Props>({
    redirectTo: '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Users
