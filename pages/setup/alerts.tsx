import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import React, { ReactElement } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import SlackForm from '../../components/SlackForm'
import SlackManifestSnippet from '../../components/SlackManifestSnippet'

interface Props {
    slackApiKey: string
    slackQuestionChannel: string
}

const Alerts: NextPageWithLayout<Props> = ({ slackApiKey, slackQuestionChannel }) => {
    const handleSkip = () => {
        Router.push('/setup/snippet')
    }

    return (
        <div>
            <main>
                <SlackManifestSnippet />

                <hr className="mb-6" />

                <SlackForm
                    slackApiKey={slackApiKey}
                    slackQuestionChannel={slackQuestionChannel}
                    redirect="/setup/snippet"
                    actionButtons={(isValid) => (
                        <>
                            <Button disabled={!isValid} type="submit">
                                Continue
                            </Button>
                            <button onClick={handleSkip} className="text-orange-600 font-semibold">
                                Skip
                            </button>
                        </>
                    )}
                />
            </main>
        </div>
    )
}

Alerts.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            subtitle="Let moderators receive alerts in Slack when new questions or replies are posted."
            title="Moderator alerts"
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    authCheck: true,
    authRedirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const { user } = await getUser(context)

        const { data: userProfileReadonly } = await supabaseServerClient(context)
            .from('squeak_profiles_readonly')
            .select(
                `id, organization:squeak_organizations(id, config:squeak_config(slack_api_key, slack_question_channel))`
            )
            .eq('user_id', user?.id)
            .single()

        const { organization } = userProfileReadonly
        const {
            config: [config],
        } = organization

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                slackApiKey: config?.slack_api_key || '',
                slackQuestionChannel: config?.slack_question_channel || '',
            },
        }
    },
})

export default Alerts
