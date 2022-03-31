import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import Router from 'next/router'
import { Field, Form, Formik, FormikComputedProps, FormikHelpers } from 'formik'
import type { definitions } from '../@types/supabase'
import React, { useCallback, useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import useActiveOrganization from '../util/useActiveOrganization'
type Config = definitions['squeak_config']

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
        <Form className="mt-6">
            <label htmlFor="slackApiKey">Slack Bot User OAuth Token</label>
            <Field onChange={handleAPIKeyChange} id="slackApiKey" name="slackApiKey" placeholder="xoxb-your-token" />
            {channels.length > 0 && (
                <>
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
        </Form>
    )
}

interface Props {
    slackApiKey: string
    slackQuestionChannel: string
    redirect?: string
    actionButtons: (isValid: boolean) => JSX.Element
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
    const { getActiveOrganization } = useActiveOrganization()

    const handleSave = async (values: InitialValues) => {
        const organizationId = getActiveOrganization()

        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                slack_api_key: values.slackApiKey,
                slack_question_channel: values.slackQuestionChannel,
            })
            .match({ organisation_id: organizationId })

        onSubmit && onSubmit(values)

        if (!error && redirect) {
            Router.push(redirect)
        }

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
                    <Form className="mt-6">
                        <SlackFormContent initialValues={initialValues} setFieldValue={setFieldValue} />
                        <div className="flex space-x-6 items-center mt-4">{actionButtons(isValid)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default SlackForm
