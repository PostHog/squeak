import { Team } from '@prisma/client'
import { GetStaticPropsResult } from 'next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { NextPageWithLayout } from '../@types/types'

import InviteUser from '../components/InviteUser'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'
import { getProfiles, ApiResponseError, getTeams } from '../lib/api'
import { withAdminGetStaticProps } from '../util/withAdminAccess'
import { GetProfilesResponse } from './api/profiles'

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
        <>
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
        </>
    )
}

Users.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout title="Profiles">
            {page}

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
