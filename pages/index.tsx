import Head from 'next/head'

import { createClient } from '@supabase/supabase-js'
import type { GetServerSideProps } from 'next'
import { GetStaticPropsResult } from 'next'

import styles from '../styles/Home.module.css'

import { definitions } from '../@types/supabase'
import AdminLayout from '../layout/AdminLayout'
import type { NextPageWithLayout } from '../@types/types'
import { ReactElement, useEffect, useState } from 'react'
import { getUser, supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import LogoutButton from '../components/LogoutButton'

type Config = definitions['squeak_config']
type UserReadonlyProfile = definitions['squeak_profiles_readonly']
type UserProfileView = definitions['squeak_profiles_view']

interface Props {}

const Home: NextPageWithLayout<Props> = () => {
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
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Home</h1>

                <LogoutButton />

                <table>
                    <th>
                        <td>First Name</td>
                        <td>Last Name</td>
                        <td>Role</td>
                    </th>
                    {profiles.map((profile) => (
                        <tr key={profile.id}>
                            <td>{profile.first_name}</td>
                            <td>{profile.last_name}</td>
                            <td>{profile.role}</td>
                        </tr>
                    ))}
                </table>
            </main>
        </div>
    )
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout>{page}</AdminLayout>
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<GetStaticPropsResult<Props>> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: config } = await supabaseClient
        .from<Config>('squeak_config')
        .select(`preflight_complete`)
        .eq('id', 1)
        .single()

    if (!config || !config?.preflight_complete) {
        return {
            redirect: {
                destination: '/setup/welcome',
                permanent: false,
            },
        }
    }

    const { user } = await getUser(context)

    if (!user) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }

    const { data: userReadonlyProfile } = await supabaseServerClient(context)
        .from<UserReadonlyProfile>('squeak_profiles_readonly')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (!userReadonlyProfile || userReadonlyProfile.role !== 'admin') {
        context.res.statusCode = 403
        return {
            props: {
                error: {
                    message: 'You must be admin',
                },
            },
        }
    }

    return {
        props: {},
    }
}

export default Home
