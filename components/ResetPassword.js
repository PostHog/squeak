import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import Input from './Input'

export default function ResetPassword({ actionButtons }) {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const handleSubmit = async ({ password }) => {
        setLoading(true)
        const { error } = await supabaseClient.auth.update({ password })
        if (error) {
            setErrorMessage(error.message)
        } else {
            setErrorMessage('Password has been updated')
        }
        setLoading(false)
    }
    return (
        <Formik
            validateOnMount
            validate={(values) => {
                const errors = {}
                if (!values.password) {
                    errors.password = 'Required'
                }
                return errors
            }}
            initialValues={{ password: '' }}
            onSubmit={handleSubmit}
        >
            {({ isValid }) => {
                return (
                    <Form className="mt-6">
                        <Input
                            type="password"
                            label="New password"
                            id="password"
                            name="password"
                            placeholder="New password"
                            errorMessage={errorMessage}
                        />

                        <div className="flex space-x-6 items-center mt-4">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}
