import Modal from '../Modal'
import { Field, Form, Formik } from 'formik'
import Button from '../Button'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useToasts } from 'react-toast-notifications'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { definitions } from '../../@types/supabase'
import { useCallback } from 'react'

type Config = definitions['squeak_config']

interface Props {
    open?: boolean
    initialValues: { allowedOrigins: string[]; allowedOrigin: string } | null
    onSubmit: () => void
    onClose: () => void
}

const AllowedOriginModal: React.VoidFunctionComponent<Props> = ({ open, onClose, onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

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

            const { error } = await supabaseClient
                .from<Config>('squeak_config')
                .update({ allowed_origins: allowedOrigins })
                .match({ organization_id: organizationId })

            addToast(error ? error.message : 'Allowed origin added', {
                appearance: error ? 'error' : 'success',
            })

            onSubmit()
        },
        [addToast, initialValues?.allowedOrigins, onSubmit, organizationId]
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

            const { error } = await supabaseClient
                .from<Config>('squeak_config')
                .update({ allowed_origins: allowedOrigins })
                .match({ organization_id: organizationId })

            addToast(error ? error.message : 'Allowed origin deleted', {
                appearance: error ? 'error' : 'success',
            })

            onSubmit()
        },
        [addToast, initialValues, onSubmit, organizationId]
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
                            <div className="flex space-x-2 mt-3">
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
