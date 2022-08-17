import { Form, Formik } from 'formik'
import Router from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'

import { ApiResponseError, updateSqueakConfig } from '../lib/api/'
import Input from './Input'

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
    const [loading, setLoading] = useState(false)

    const handleSaveNotifications = async (values: InitialValues) => {
        setLoading(true)

        try {
            await updateSqueakConfig({
                company_name: values.companyName,
                company_domain: values.companyDomain,
            })

            addToast('Details saved', { appearance: 'success' })
            redirect && Router.push(redirect)
        } catch (err) {
            if (err instanceof ApiResponseError) {
                addToast(err.message, { appearance: 'error' })
            } else {
                throw err
            }
        } finally {
            setLoading(false)
        }
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
                        <Input
                            label="Company name"
                            id="companyName"
                            name="companyName"
                            placeholder="Squeak"
                            helperText="Shows as the sender in email notifications"
                        />

                        <Input
                            label="Site URL"
                            id="companyDomain"
                            name="companyDomain"
                            placeholder="https://yoursite.com"
                            helperText="The root URL where Squeak! is installed, with protocol like: https://yoursite.com"
                        />

                        <div className="flex items-center mt-4 space-x-6">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default CompanyDetails
