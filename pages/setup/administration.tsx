import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Auth, useUser } from '@supabase/supabase-auth-helpers/react'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { ReactElement, useEffect } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import SetupLayout from '../../layout/SetupLayout'

interface Props {}

const Administration: NextPageWithLayout<Props> = () => {
    const { user } = useUser()

    useEffect(() => {
        if (user) {
            Router.push('/setup/notifications')
        }
    }, [user])

    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Administration</h1>

                <p>Squeak! uses GitHub authentication for access to the admin portal.</p>

                {!user && <Auth supabaseClient={supabaseClient} redirectTo="/setup/administration" />}
            </main>
        </div>
    )
}

Administration.getLayout = function getLayout(page: ReactElement) {
    return <SetupLayout>{page}</SetupLayout>
}

export const getServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    return {
        props: {},
    }
}

export default Administration
