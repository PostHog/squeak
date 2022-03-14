import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik, FormikComputedProps, FormikHelpers } from 'formik'
import debounce from 'lodash.debounce'
import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']

interface Props {
    slackApiKey?: string | undefined
    slackQuestionChannel?: string | undefined
    slackSigningSecret?: string | undefined
}

const SlackForm = ({ setFieldValue, isValid, initialValues }: FormikComputedProps<Props> & FormikHelpers<Props>) => {
    const [channels, setChannels] = useState([])

    const getChannels = async (slackApiKey: string) => {
        if (slackApiKey) {
            const body = JSON.stringify({ token: slackApiKey })
            const data = await fetch('/api/slack/channels', { method: 'POST', body }).then((res) => res.json())
            if (data.error) {
                setChannels([])
            } else {
                setChannels(data)
                if (!initialValues.slackQuestionChannel) {
                    setFieldValue('slackQuestionChannel', data[0].id)
                }
            }
        }
    }

    const debouncedGetChannels = useCallback(
        debounce((slackApiKey: string) => getChannels(slackApiKey), 1000),
        []
    )

    const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setFieldValue('slackApiKey', value)
        debouncedGetChannels(value)
    }

    const handleSkip = () => {
        Router.push('/setup/snippet')
    }

    useEffect(() => {
        if (initialValues.slackApiKey) {
            getChannels(initialValues.slackApiKey)
        }
    }, [])

    return (
        <Form className="mt-6">
            <label htmlFor="slackApiKey">Slack Bot User OAuth Token</label>
            <Field onChange={handleAPIKeyChange} id="slackApiKey" name="slackApiKey" placeholder="xoxb-your-token" />
            {channels.length > 0 && (
                <>
                    <label htmlFor="slackSigningSecret">Slack signing secret</label>
                    <Field id="slackSigningSecret" name="slackSigningSecret" placeholder="Slack signing secret" />
                    <label htmlFor="slackQuestionChannel">Slack question channel</label>
                    <Field as="select" id="slackQuestionChannel" name="slackQuestionChannel">
                        {channels.map(({ name, id }) => {
                            return (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            )
                        })}
                    </Field>
                </>
            )}
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
}

const Alerts: NextPageWithLayout<Props> = ({ slackApiKey, slackQuestionChannel, slackSigningSecret }) => {
    const [manifestCopied, setManifestCopied] = useState(false)

    const manifest = `display_information:
  name: Squeak
  description: A Q&A widget for your docs
  background_color: "#F97316"
features:
  app_home:
    home_tab_enabled: false
    messages_tab_enabled: true
    messages_tab_read_only_enabled: true
  bot_user:
    display_name: Squeak
    always_online: true
oauth_config:
  scopes:
    bot:
      - channels:history
      - channels:join
      - channels:manage
      - channels:read
      - chat:write.customize
      - chat:write.public
      - chat:write
settings:
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(manifest)
        setManifestCopied(true)
        setTimeout(() => {
            setManifestCopied(false)
        }, 2000)
    }

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

    return (
        <div>
            <main>
                <p>
                    Create a Slack App at{' '}
                    <a target="_blank" rel="noreferrer" href="https://api.slack.com/apps?new_app=1">
                        https://api.slack.com/apps
                    </a>
                    , from the following app manifest:
                </p>

                <SyntaxHighlighter className="max-h-40 overflow-scroll">{manifest}</SyntaxHighlighter>

                <button onClick={copyToClipboard} className="mt-2 mb-6 text-orange-600 font-semibold flex space-x-2">
                    <span>Copy to clipboard</span>
                    {manifestCopied && <span className="text-green-600 font-normal">Copied</span>}
                </button>

                <hr className="mb-6" />

                <Formik
                    validateOnMount
                    validate={(values) => {
                        const errors: Props = {}
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
                    {SlackForm}
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

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    authCheck: true,
    authRedirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
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
