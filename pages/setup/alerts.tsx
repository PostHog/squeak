import { supabaseClient, supabaseServerClient, withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import type { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'

type Config = definitions['squeak_config']

interface Props {
    slackApiKey: string | undefined
    slackQuestionChannel: string | undefined
    slackSigningSecret: string | undefined
}

const Alerts: NextPageWithLayout<Props> = ({ slackApiKey, slackQuestionChannel, slackSigningSecret }) => {
    const handleSave = async (values: Props) => {
        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                slack_api_key: values.slackApiKey,
                slack_question_channel: values.slackQuestionChannel,
                slack_signing_secret: values.slackSigningSecret,
            })
            .match({ id: 1 })

        if (!error) Router.push('/setup/snippet')

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?
    }

    const handleSkip = () => {
        Router.push('/setup/snippet')
    }

    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <p>
                    Find the following information at{' '}
                    <a href="#">&#123;yourslack&#125;.slack.com/admin/not/sure/full/path</a>
                </p>
                <Formik
                    validateOnMount
                    validate={(values) => {
                        const errors: any = {}
                        if (!values.slackApiKey) {
                            errors.slackApiKey = 'Required'
                        }
                        if (!values.slackQuestionChannel) {
                            errors.slackQuestionChannel = 'Required'
                        }
                        if (!values.slackSigningSecret) {
                            errors.slackSigningSecret = 'Required'
                        }
                        return errors
                    }}
                    initialValues={{
                        slackApiKey,
                        slackQuestionChannel,
                        slackSigningSecret,
                    }}
                    onSubmit={handleSave}
                >
                    {({ isValid }) => {
                        return (
                            <Form className="mt-6">
                                <label htmlFor="slackApiKey">Slack API key</label>
                                <Field id="slackApiKey" name="slackApiKey" placeholder="Slack API key" />

                                <label htmlFor="slackQuestionChannel">Slack question channel</label>
                                <Field
                                    id="slackQuestionChannel"
                                    name="slackQuestionChannel"
                                    placeholder="Slack question channel"
                                />

                                <label htmlFor="slackSigningSecret">Slack signing secret</label>
                                <Field
                                    id="slackSigningSecret"
                                    name="slackSigningSecret"
                                    placeholder="Slack signing secret"
                                />
                                <div className="flex space-x-6 items-center mt-4">
                                    <Button disabled={!isValid} type="submit">
                                        Continue
                                    </Button>
                                    <button onClick={handleSkip} className="text-orange-600 font-semibold">
                                        Skip
                                    </button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
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

export const getServerSideProps = withAuthRequired({
    redirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        // TODO(JS) Check the user is an admin

        const { data: config } = await supabaseServerClient(context)
            .from<Config>('squeak_config')
            .select(`slack_api_key, slack_question_channel, slack_signing_secret`)
            .eq('id', 1)
            .single()

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                slackApiKey: config?.slack_api_key || '',
                slackQuestionChannel: config?.slack_question_channel || '',
                slackSigningSecret: config?.slack_signing_secret || '',
            },
        }
    },
})

export default Alerts
