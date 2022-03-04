import Head from 'next/head'

import type {GetServerSideProps, NextPage} from 'next'

import styles from '../../styles/Home.module.css'

interface Props {
    supabase: {
        anonKey: string,
        url: string,
    }
}

const PreflightWelcome: NextPage<Props> = ({supabase}) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..."/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Preflight
                </h1>

                <p>Step 4. Let's create your account</p>

                <p>Some spill about what we need to do here...</p>

                <p>GitHub auth button here</p>

                <button>Complete</button>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {
            supabase: {
                url: process.env.SUPABASE_URL,
                anonKey: process.env.SUPABASE_ANON_KEY,
            },
        },
    }
}

export default PreflightWelcome
