import Head from 'next/head'
import { ReactElement } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'

interface Props {}

const Welcome: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <p className="mb-0 font-semibold opacity-70">Accounts you'll need:</p>

            <table>
                <tr>
                    <td>Supabase</td>
                    <td>Database hosting</td>
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

            <Button href="/setup/database" className="mt-12 mb-2">
                Continue
            </Button>

            <p className="opacity-70">This should take about 5 mins if you’re already signed up with these services.</p>
        </div>
    )
}

Welcome.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Let's get to Squeakin'!"
            subtitle="This wizard runs through the process of connecting to the services you’ll need to run Squeak!"
        >
            {page}
        </SetupLayout>
    )
}

export default Welcome
