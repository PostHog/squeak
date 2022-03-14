import type { definitions } from '../@types/supabase'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import Router from 'next/router'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
    redirect?: string
    actionButtons: (isValid: boolean) => JSX.Element
}

interface InitialValues {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
}

const NotificationForm: React.VoidFunctionComponent<Props> = ({
    mailgunApiKey,
    mailgunDomain,
    companyName,
    companyDomain,
    redirect,
    actionButtons,
}) => {
    const handleSaveNotifications = async (values: InitialValues) => {
        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                mailgun_api_key: values.mailgunApiKey,
                mailgun_domain: values.mailgunDomain,
                company_name: values.companyName,
                company_domain: values.companyDomain,
            })
            .match({ id: 1 })

        if (!error && redirect) {
            Router.push(redirect)
        }

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?
    }

    const initialValues: InitialValues = {
        mailgunApiKey: mailgunApiKey,
        mailgunDomain: mailgunDomain,
        companyName: companyName,
        companyDomain: companyDomain,
    }

    return (
        <Formik
            validateOnMount
            validate={(values) => {
                const errors: {
                    mailgunApiKey?: string
                    mailgunDomain?: string
                    companyName?: string
                    companyDomain?: string
                } = {}
                if (!values.mailgunApiKey) {
                    errors.mailgunApiKey = 'Required'
                }
                if (!values.mailgunDomain) {
                    errors.mailgunDomain = 'Required'
                }
                if (!values.companyName) {
                    errors.companyName = 'Required'
                }
                if (!values.companyDomain) {
                    errors.companyDomain = 'Required'
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

                        <label htmlFor="companyName">Company name</label>
                        <Field id="companyName" name="companyName" placeholder="Squeak" />

                        <label htmlFor="companyDomain">Site URL (without protocol)</label>
                        <Field id="companyDomain" name="companyDomain" placeholder="squeak.posthog.com" />

                        <div className="flex space-x-6 items-center mt-4 mb-12">{actionButtons(isValid)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default NotificationForm
