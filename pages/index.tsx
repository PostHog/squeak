import Head from 'next/head'

import {createClient} from '@supabase/supabase-js'
import type {GetServerSideProps, NextPage} from 'next'
import {GetStaticPropsResult} from "next";

import styles from '../styles/Home.module.css'

import {definitions} from "../@types/supabase";

type Config = definitions['config'];

interface Props {
}

const Home: NextPage<Props> = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..."/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Home
                </h1>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    const supabaseUrl = process.env.SUPABASE_URL as string;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const {data: config} = await supabaseClient
        .from<Config>('config')
        .select(`preflightComplete`)
        .eq('id', 1)
        .single()

    if (!config || !config?.preflightComplete) {
        return {
            redirect: {
                destination: '/preflight',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}

export default Home;
