import { Field, Form, Formik } from 'formik'
import { useToasts } from 'react-toast-notifications'
import { useCallback } from 'react'

import Modal from '../Modal'
import Button from '../Button'
import { updateSqueakConfig } from '../../lib/api'
import { ApiResponseError } from '../../lib/api/client'

interface Props {
    open?: boolean
    initialValues: { allowedOrigins: string[]; allowedOrigin: string } | null
    onSubmit: () => void
    onClose: () => void
}

const AllowedOriginModal: React.VoidFunctionComponent<Props> = ({ open, onClose, onSubmit, initialValues }) => {
    const { addToast } = useToasts()

    const doConfigUpdate = async (allowedOrigins: string[]) => {
        try {
            await updateSqueakConfig({ allowed_origins: allowedOrigins })
            addToast('Allowed origin added', { appearance: 'success' })
        } catch (error) {
            if (error instanceof ApiResponseError) {
                addToast(error.message, { appearance: 'error' })
            }
        }
    }

    const handleSave = useCallback(
        async ({ allowedOrigin }: { allowedOrigin: string }) => {
            if (initialValues?.allowedOrigins.find((origin) => origin === allowedOrigin)) {
                return
            }

            // Remove the old version of the allowed  origin
            const filteredValues = initialValues?.allowedOrigins.filter(
                (origin) => origin !== initialValues?.allowedOrigin
            )

            const allowedOrigins = [...(filteredValues || []), allowedOrigin]

            await doConfigUpdate(allowedOrigins)

            onSubmit()
        },
        [addToast, initialValues?.allowedOrigins, onSubmit]
    )

    const handleDelete = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()

            if (!initialValues) {
                return
            }

            if (!initialValues.allowedOrigins.find((origin) => origin === initialValues.allowedOrigin)) {
                return
            }

            const allowedOrigins = initialValues.allowedOrigins.filter(
                (origin) => origin !== initialValues.allowedOrigin
            )

            await doConfigUpdate(allowedOrigins)

            onSubmit()
        },
        [addToast, initialValues, onSubmit]
    )

    return (
        <Modal onClose={onClose} open={open}>
            <Formik
                validateOnMount
                validate={(values) => {
                    const errors: { allowedOrigin?: string } = {}

                    if (!values.allowedOrigin) {
                        errors.allowedOrigin = 'Required'
                    }

                    return errors
                }}
                initialValues={{ allowedOrigin: initialValues?.allowedOrigin || '' }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <label htmlFor="allowedOrigin">Allowed origin</label>
                            <Field
                                id="allowedOrigin"
                                name="allowedOrigin"
                                placeholder="https://yoursite.com"
                                type="url"
                            />
                            <p className="text-sm opacity-70">Ex: https://yoursite.com</p>
                            <div className="flex mt-3 space-x-2">
                                <Button disabled={!isValid} type="submit">
                                    {initialValues?.allowedOrigin !== '' ? 'Save' : 'Add'}
                                </Button>
                                {initialValues?.allowedOrigin !== '' && (
                                    <Button onClick={handleDelete} className="bg-red-500">
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </Modal>
    )
}

export default AllowedOriginModal
