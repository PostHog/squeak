import Head from 'next/head'

import type { NextPage } from 'next'
import { GetStaticPropsResult } from 'next'

import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { definitions } from '../../@types/supabase'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser, Auth } from '@supabase/supabase-auth-helpers/react'

type Config = definitions['squeak_config']

interface Props {}

const PreflightWelcome: NextPage<Props> = () => {
    const { user, error } = useUser()

    if (!user)
        return (
            <>
                {error && <p>{error.message}</p>}
                <Auth
                    supabaseClient={supabaseClient}
                    redirectTo="/preflight"
                    providers={['github']}
                    onlyThirdPartyProviders
                    magicLink
                />
            </>
        )

    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Preflight</h1>

                <p>Welcome to Squeak! Let's get you setup.</p>
                <Link href="/preflight/supabase" passHref>
                    <button>Let's go!</button>
                </Link>
            </main>
        </div>
    )
}

export const getServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        {
            autoRefreshToken: false,
            persistSession: false,
        }
    )

    const { data: config } = await supabaseClient.from<Config>('squeak_config').select(`id`).eq('id', 1).single()

    // If we don't have data at all, we need to create a config row
    if (!config) {
        await supabaseClient.from<Config>('squeak_config').insert({
            id: 1,
            preflightComplete: false,
        })

        // TODO(JS): Handle errors here?
    }

    return {
        props: {},
    }
}

export default PreflightWelcome
