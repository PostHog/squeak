import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import Router from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import type { definitions } from '../@types/supabase'
import useActiveOrganization from '../util/useActiveOrganization'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    redirect?: string
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
}

interface InitialValues {
    mailgunApiKey: string
    mailgunDomain: string
}

const NotificationForm: React.VoidFunctionComponent<Props> = ({
    mailgunApiKey,
    mailgunDomain,
    redirect,
    actionButtons,
}) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const [loading, setLoading] = useState(false)

    const handleSaveNotifications = async (values: InitialValues) => {
        setLoading(true)
        const organizationId = getActiveOrganization()

        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                mailgun_api_key: values.mailgunApiKey,
                mailgun_domain: values.mailgunDomain,
            })
            .match({ organization_id: organizationId })

        if (!error && redirect) {
            Router.push(redirect)
        }

        addToast(error ? error.message : 'Notification settings saved', {
            appearance: error ? 'error' : 'success',
        })

        setLoading(false)
    }

    const initialValues: InitialValues = {
        mailgunApiKey: mailgunApiKey,
        mailgunDomain: mailgunDomain,
    }

    return (
        <Formik
            validateOnMount
            validate={(values) => {
                const errors: {
                    mailgunApiKey?: string
                    mailgunDomain?: string
                } = {}
                if (!values.mailgunApiKey) {
                    errors.mailgunApiKey = 'Required'
                }
                if (!values.mailgunDomain) {
                    errors.mailgunDomain = 'Required'
                }
                return errors
            }}
            initialValues={initialValues}
            onSubmit={handleSaveNotifications}
        >
            {({ isValid }) => {
                return (
                    <Form className="mt-6">
                        <label htmlFor="mailgunApiKey">Mailgun API key</label>
                        <Field id="mailgunApiKey" name="mailgunApiKey" placeholder="Mailgun API key" />

                        <label htmlFor="mailgunDomain">Mailgun domain</label>
                        <Field id="mailgunDomain" name="mailgunDomain" placeholder="Mailgun domain" />

                        <div className="flex space-x-6 items-center mt-4">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default NotificationForm
