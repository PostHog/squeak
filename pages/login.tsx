import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Auth } from '@supabase/ui'
import { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import absoluteUrl from 'next-absolute-url'
import Router from 'next/router'
import { useEffect } from 'react'
import Logo from '../components/Logo'
import Head from 'next/head'

interface Props {
    baseUrl: string
}

const Login: NextPage<Props> = () => {
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
                <title>Squeak! | A Q&A widget for your docs</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="flex justify-center sm:mx-auto sm:w-full sm:max-w-md">
                    <Logo className="w-40" />
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <Auth className="login" supabaseClient={supabaseClient} />
                    </div>
                </div>
            </div>
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
