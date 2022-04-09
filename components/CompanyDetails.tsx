import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import Router from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import type { definitions } from '../@types/supabase'
import useActiveOrganization from '../util/useActiveOrganization'

type Config = definitions['squeak_config']

interface Props {
    companyName: string
    companyDomain: string
    redirect?: string
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
}

interface InitialValues {
    companyName: string
    companyDomain: string
}

const CompanyDetails: React.VoidFunctionComponent<Props> = ({
    companyName,
    companyDomain,
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
                company_name: values.companyName,
                company_domain: values.companyDomain,
            })
            .match({ organization_id: organizationId })

        if (!error && redirect) {
            Router.push(redirect)
        }

        addToast(error ? error.message : 'Details saved', {
            appearance: error ? 'error' : 'success',
        })

        setLoading(false)
    }

    const initialValues: InitialValues = {
        companyName: companyName,
        companyDomain: companyDomain,
    }

    return (
        <Formik
            validateOnMount
            validate={(values) => {
                const errors: {
                    companyName?: string
                    companyDomain?: string
                } = {}
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
                        <label htmlFor="companyName">Company name</label>
                        <Field id="companyName" name="companyName" placeholder="Squeak" />

                        <label htmlFor="companyDomain">Site URL</label>
                        <Field id="companyDomain" name="companyDomain" placeholder="https://squeak.posthog.com" />

                        <div className="flex space-x-6 items-center mt-4">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default CompanyDetails
