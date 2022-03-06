import Head from 'next/head'

import type { GetServerSideProps, NextPage } from 'next'
import { GetStaticPropsResult } from 'next'

import styles from '../../styles/Home.module.css'

interface Props {}

const PreflightWelcome: NextPage<Props> = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Preflight</h1>

                <p>Step 4. Let's create your account</p>

                <p>Some spill about what we need to do here...</p>

                <p>GitHub auth button here</p>

                <button>Complete</button>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    return {
        props: {},
    }
}

export default PreflightWelcome
