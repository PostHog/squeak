import { Form, Formik, FormikComputedProps, FormikHelpers } from 'formik'
import debounce from 'lodash.debounce'
import Router from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import Input from './Input'
import Select from './Select'
import { updateSqueakConfig } from '../lib/api'

type SlackFormContentProps = Pick<FormikComputedProps<InitialValues>, 'initialValues'> &
    Pick<FormikHelpers<InitialValues>, 'setFieldValue'>

const SlackFormContent: React.VoidFunctionComponent<SlackFormContentProps> = ({ setFieldValue, initialValues }) => {
    const [channels, setChannels] = useState([])

    const getChannels = useCallback(
        async (slackApiKey: string) => {
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
        },
        [initialValues.slackQuestionChannel, setFieldValue]
    )

    const debouncedGetChannels = useCallback(
        debounce((slackApiKey: string) => getChannels(slackApiKey), 1000),
        [getChannels]
    )

    const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setFieldValue('slackApiKey', value)
        debouncedGetChannels(value)
    }

    useEffect(() => {
        if (initialValues.slackApiKey) {
            getChannels(initialValues.slackApiKey)
        }
    }, [getChannels, initialValues.slackApiKey])

    return (
        <Form className="mt-0">
            <h3 className="text-base font-semibold">Configure</h3>
            <Input
                label="Slack Bot User OAuth Token"
                onChange={handleAPIKeyChange}
                id="slackApiKey"
                name="slackApiKey"
                placeholder="xoxb-your-token"
                helperText="Find this on the OAuth & Permissions page"
            />
            {channels.length > 0 && (
                <>
                    <Select
                        options={channels}
                        label="Slack question channel"
                        id="slackQuestionChannel"
                        name="slackQuestionChannel"
                        helperText="Channel where new questions alerts should be sent"
                    />
                </>
            )}
        </Form>
    )
}

interface Props {
    slackApiKey: string
    slackQuestionChannel: string
    redirect?: string
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
    onSubmit?: (values: InitialValues) => void
}

interface InitialValues {
    slackApiKey: string
    slackQuestionChannel: string
}

const SlackForm: React.VoidFunctionComponent<Props> = ({
    slackApiKey,
    slackQuestionChannel,
    redirect,
    actionButtons,
    onSubmit,
}) => {
    const [loading, setLoading] = useState(false)

    const handleSave = async (values: InitialValues) => {
        setLoading(true)

        await updateSqueakConfig({
            slack_api_key: values.slackApiKey,
            slack_question_channel: values.slackQuestionChannel,
        })
        setLoading(false)
        onSubmit && onSubmit(values)

        if (redirect) Router.push(redirect)

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?
    }

    return (
        <Formik
            validateOnMount
            validate={(values) => {
                const errors: {
                    slackApiKey?: string
                    slackQuestionChannel?: string
                } = {}
                if (!values.slackApiKey) {
                    errors.slackApiKey = 'Required'
                }
                if (!values.slackQuestionChannel) {
                    errors.slackQuestionChannel = 'Required'
                }
                return errors
            }}
            initialValues={{
                slackApiKey,
                slackQuestionChannel,
            }}
            onSubmit={handleSave}
        >
            {({ initialValues, isValid, setFieldValue }) => {
                return (
                    <Form className="mt-0">
                        <ol className="pl-2 ml-4 list-decimal">
                            <li className="h-0 m-0 overflow-hidden leading-[0]"></li>
                            <li>
                                <SlackFormContent initialValues={initialValues} setFieldValue={setFieldValue} />
                            </li>
                            <li>
                                <div className="text-[16px] font-semibold opacity-75 my-2">
                                    Install app to workspace
                                </div>
                            </li>
                            <li>
                                <div className="text-[16px] font-semibold opacity-75 my-2">Add app to channel</div>
                                <p>
                                    Visit the Slack channel (entered in step 2) and type{' '}
                                    <code className="p-1 text-sm bg-gray-200">/apps</code>, choose{' '}
                                    <strong className="font-semibold">Add apps to this channel</strong>, and install the
                                    Squeak app you created in step 1.
                                </p>
                            </li>
                        </ol>
                        <div className="flex items-center mt-4 space-x-6">{actionButtons(isValid, loading)}</div>
                        <div className="text-[16px] font-semibold opacity-75 mt-4">
                            After the above setup is complete, visit the <Link href="/slack">Import Slack threads</Link>{' '}
                            page to see the latest 50 threads you can import.
                        </div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default SlackForm
