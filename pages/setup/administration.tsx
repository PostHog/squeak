import Head from 'next/head'

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser, Auth } from '@supabase/supabase-auth-helpers/react'
import { NextPageWithLayout } from '../../@types/types'
import { ReactElement } from 'react'
import SetupLayout from '../../layout/SetupLayout'
import absoluteUrl from 'next-absolute-url'

interface Props {
    baseUrl: string
}

const Administration: NextPageWithLayout<Props> = ({ baseUrl }) => {
    const { user } = useUser()

    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Administration</h1>

                <p>Squeak! uses GitHub authentication for access to the admin portal.</p>

                {!user && (
                    <Auth
                        supabaseClient={supabaseClient}
                        redirectTo={`${baseUrl}/setup/administration`}
                        providers={['github']}
                        onlyThirdPartyProviders
                        magicLink
                    />
                )}

                {user && <p>Connected to Github</p>}

                <Link href="/setup/notifications" passHref>
                    <button disabled={user == null}>Continue</button>
                </Link>
            </main>
        </div>
    )
}

Administration.getLayout = function getLayout(page: ReactElement) {
    return <SetupLayout>{page}</SetupLayout>
}

export const getServerSideProps = ({ req }: GetServerSidePropsContext): GetServerSidePropsResult<Props> => {
    const url = absoluteUrl(req)

    return {
        props: {
            baseUrl: url.origin,
        },
    }
}

export default Administration
