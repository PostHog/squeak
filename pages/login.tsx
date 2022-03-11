import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Auth } from '@supabase/ui'
import { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import absoluteUrl from 'next-absolute-url'
import Head from 'next/head'
import Router from 'next/router'
import { useEffect } from 'react'

interface Props {
    baseUrl: string
}

const Login: NextPage<Props> = ({ baseUrl }) => {
    useEffect(() => {
        const { data: subscription } = supabaseClient.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_IN') {
                Router.push('/')
            }

            return () => {
                subscription?.unsubscribe()
            }
        })
    }, [])

    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Login</h1>

                <Auth supabaseClient={supabaseClient} />
            </main>
        </div>
    )
}

export const getServerSideProps = ({ req }: GetServerSidePropsContext): GetServerSidePropsResult<Props> => {
    const url = absoluteUrl(req)

    return {
        props: {
            baseUrl: url.origin,
        },
    }
}

export default Login
