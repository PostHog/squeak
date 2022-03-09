import { getUser, supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import type { GetServerSideProps } from 'next'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import { ReactElement, useEffect, useState } from 'react'
import { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import LogoutButton from '../components/LogoutButton'
import ProfileTable from '../components/ProfileTable'
import AdminLayout from '../layout/AdminLayout'

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
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Home</h1>

                <LogoutButton />

                <ProfileTable profiles={profiles} />
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
