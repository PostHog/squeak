import { Team } from '@prisma/client'
import { GetStaticPropsResult } from 'next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { NextPageWithLayout } from 'src/@types/types'

import InviteUser from 'src/components/InviteUser'
import ProfileTable from 'src/components/ProfileTable'
import AdminLayout from 'src/layout/AdminLayout'
import { getProfiles, ApiResponseError, getTeams } from 'src/lib/api'
import { withAdminGetStaticProps } from 'src/util/withAdminAccess'
import { GetProfilesResponse } from 'src/pages/api/profiles'

interface Props {}

const Users: NextPageWithLayout<Props> = () => {
    const { addToast } = useToasts()
    const [profiles, setProfiles] = useState<GetProfilesResponse[]>([])
    const [teams, setTeams] = useState<Team[]>([])

    const fetchProfiles = useCallback(async () => {
        try {
            const { data } = await getProfiles()
            if (!data) {
                addToast('Error fetching profiles')
                return
            }
            setProfiles(data)
        } catch (err) {
            if (err instanceof ApiResponseError) {
                addToast(err.message, { appearance: 'error' })
            }
        }
    }, [addToast])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    useEffect(() => {
        getTeams().then(({ data }) => {
            if (data) {
                setTeams(data)
            }
        })
    }, [])

    return (
        <AdminLayout title="Profiles">
            <div className="flex items-center space-between">
                <p className="flex-1 pb-4">This lists all users in your database.</p>
                <InviteUser
                    className="mb-6"
                    onInvite={() => {
                        fetchProfiles()
                    }}
                />
            </div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <ProfileTable teams={teams} profiles={profiles} />
            </div>
            <p className="pt-4">
                <strong>Users</strong> can ask questions and post responses <br />
                <strong>Moderators</strong> can sign in here to manage/remove questions/replies <br />
                <strong>Admins</strong> can administer user roles
            </p>
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: () => '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Users
