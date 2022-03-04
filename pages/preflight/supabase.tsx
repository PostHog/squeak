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

                <p>Step 1. Let's setup Supabase</p>

                <p>Some spill about what we need to do here...</p>


                <p>If the user doesn't have the tables setup... show:</p>
                <div style={{border: "1px solid grey"}}>
                    <h5>Set it up for me (recommended)</h5>

                    <p>Oops, to let us take care of this, there's some extra config we need, <a href="#">[read the docs]</a></p>
                    <button disabled>Setup Supabase</button>

                    <h5>I can handle the setup</h5>
                    <p>1. Run the following SQL in Supabase, <a href="#">[read the docs]</a></p>
                    <pre><code>Dump the SQL to run here in a nice copy'able box</code></pre>
                    <p>2. After running the SQL, let's validate it's working</p>
                    <button>Validate Supabase</button>
                </div>

                <p>If the user does have the tables setup... show:</p>
                <p>Nice UI here to indicate this step is complete</p>
                <Link href="/preflight/slack">
                    <button>Next</button>
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
