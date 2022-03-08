import { GetStaticPropsResult, NextPage } from 'next'
import { withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import styles from '../../styles/Home.module.css'
import Head from 'next/head'

interface Props {}

const PreflightSuccess: NextPage<Props> = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Install JS snippet</h1>

                <p>
                    Add this code snippet on the page(s) where you want Squeak! to appear. Squeak! only looks at path
                    named - query parameters are ignored.
                </p>

                <label>Embed code</label>

                <pre>
                    <code>Code here...</code>
                </pre>

                <hr />

                <h3>Setup complete</h3>
                <p>Now you can manage users and moderate content in the Squeak! admin portal.</p>

                <button>Visit admin</button>
            </main>
        </div>
    )
}

export const getServerSideProps = withAuthRequired({
    redirectTo: '/setup',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default PreflightSuccess
