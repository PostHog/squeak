import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import React, { ReactElement } from 'react'

import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import SlackForm from '../../components/SlackForm'
import SlackManifestSnippet from '../../components/SlackManifestSnippet'
import prisma from '../../lib/db'

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
                            <button onClick={handleSkip} className="font-semibold text-accent-light">
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
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        const config = await prisma.squeakConfig.findFirst({
            select: {
                slack_api_key: true,
                slack_question_channel: true,
            },
        })

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
