import Head from 'next/head'
import Link from 'next/link'

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

                <p>Step 2. Let's setup Slack (optional)</p>

                <p>Some spill about what we need to do here...</p>



                <p>Enter your Slack credentials</p>
                <input type="text" placeholder="Slack API Key"/>

                <button>Save and next</button>
                <Link href="/preflight/mailgun">
                    <button>Skip this step</button>
                </Link>
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
