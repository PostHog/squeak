import { ReactElement } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import { GetStaticPropsResult } from 'next'

interface Props {}

const Welcome: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <p className="font-bold opacity-70 mb-4">Accounts you'll need:</p>

            <table>
                <tr>
                    <td className="pr-8">Supabase</td>
                    <td>Database hosting, authentication</td>
                </tr>
                <tr>
                    <td>Mailgun</td>
                    <td>Email notifications for thread updates</td>
                </tr>
                <tr>
                    <td>Slack</td>
                    <td>Moderator alerts, import community threads</td>
                </tr>
            </table>

            <Button href="/setup/database" className="mt-12 mb-2">
                Continue
            </Button>

            <p className="opacity-70">This should take about 10 mins if you’re already signed up with these services.</p>

            <hr className="my-8" />

            <p className="opacity-70"><strong>Want to get set up even faster?</strong> <a href="https://app.squeak.posthog.com" className="text-semibold">Try Squeak! Cloud</a></p>

        </div>
    )
}

Welcome.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Let's get to Squeakin'!"
            subtitle="This wizard runs through the process of connecting to the services you’ll need to self-host Squeak!"
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Welcome
