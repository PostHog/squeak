import Head from 'next/head'

import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { ReactElement } from 'react'
import SetupLayout from '../../layout/SetupLayout'
import { NextPageWithLayout } from '../../@types/types'

interface Props {}

const Welcome: NextPageWithLayout<Props> = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Let's get to Squeakin!`</h1>

                <p>This wizard runs through the process of connecting to the services you’ll need to run Squeak!</p>

                <p>Accounts you'll need:</p>

                <table>
                    <tr>
                        <td>Supabase</td>
                        <td>Database hosting</td>
                    </tr>
                    <tr>
                        <td>Github</td>
                        <td>App management, admin-y things</td>
                    </tr>
                    <tr>
                        <td>Mailgun</td>
                        <td>Email notifications for thread updates</td>
                    </tr>
                    <tr>
                        <td>Slack</td>
                        <td>Moderator notifications</td>
                    </tr>
                </table>

                <Link href="/setup/database" passHref>
                    <button>Continue</button>
                </Link>

                <p>This should take about 5 mins if you’re already signed up with these services.</p>
            </main>
        </div>
    )
}

Welcome.getLayout = function getLayout(page: ReactElement) {
    return <SetupLayout>{page}</SetupLayout>
}

export default Welcome
