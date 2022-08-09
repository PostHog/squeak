import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { doPost } from '../lib/api'
import Input from './Input'

export default function ResetPassword({ actionButtons }) {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()

    const handleSubmit = async ({ password }) => {
        setLoading(true)
        try {
            await doPost('/api/password/reset', { password, token: router.query.token })
            setErrorMessage('Password has been updated')
            router.push('/login')
        } catch (error) {
            setErrorMessage(error.message)
        } finally {
            setLoading(false)
        }
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

                        <div className="flex items-center mt-4 space-x-6">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}
