import { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import Head from 'next/head'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'

import Router from 'next/router'
import { Auth } from '@supabase/ui'
import { useEffect } from 'react'

interface Props {}

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
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Login</h1>

                <Auth supabaseClient={supabaseClient} providers={['github']} onlyThirdPartyProviders />
            </main>
        </div>
    )
}

export default Login
