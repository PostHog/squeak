import { createClient } from '@supabase/supabase-js'
import type { GetServerSideProps } from 'next'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import { ReactElement } from 'react'
import { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'

type Config = definitions['squeak_config']

interface Props {}

const Home: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Home</h1>
            </main>
        </div>
    )
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout>{page}</AdminLayout>
}

export const getServerSideProps: GetServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
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

    return {
        props: {},
    }
}

export default Home
