import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { WebhookValues } from '../@types/types'

import useActiveOrganization from '../hooks/useActiveOrganization'
import Button from './Button'
import Input from './Input'
import { createWebhook, deleteWebhook, updateWebhook } from '../lib/api'
import { ApiResponseError } from '../lib/api/client'

type FormValues = Pick<WebhookValues, 'url'>

interface Props {
    onSubmit: () => void
    initialValues: WebhookValues | null
}

const Webhook: React.VoidFunctionComponent<Props> = ({ onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const [saveLoading, setSaveloading] = useState(false)
    const [deleteLoading, setDeleteloading] = useState(false)

    const handleSave = async ({ url }: FormValues) => {
        setSaveloading(true)
        if (initialValues) {
            try {
                await updateWebhook(initialValues.id, { url })
                addToast('Webhook updated', { appearance: 'success' })
            } catch (err) {
                if (err instanceof ApiResponseError) {
                    addToast(err.message, { appearance: 'error' })
                }
            }
        } else {
            try {
                await createWebhook({ url, type: 'webhook' })
                addToast('Webhook created', { appearance: 'success' })
            } catch (err) {
                if (err instanceof ApiResponseError) {
                    addToast(err.message, { appearance: 'error' })
                }
            }
        }
        setSaveloading(false)
        onSubmit()
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteloading(true)
        if (!initialValues) {
            return
        }

        await deleteWebhook(initialValues.id)

        setDeleteloading(false)
        onSubmit()
    }
    return (
        <>
            <h3 className="mb-4 text-xl">Outgoing webhook</h3>
            <Formik
                validateOnMount
                validate={(values) => {
                    const errors: { url?: string } = {}
                    if (!values.url) {
                        errors.url = 'Required'
                    }
                    return errors
                }}
                initialValues={{ url: initialValues?.url || '' }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <Input label="Webhook URL" id="url" name="url" type="url" placeholder="Webhook URL" />
                            <div className="flex mt-3 space-x-2">
                                <Button loading={saveLoading} disabled={!isValid} type="submit">
                                    {initialValues ? 'Save' : 'Add'}
                                </Button>
                                {initialValues && (
                                    <Button
                                        loading={deleteLoading}
                                        onClick={handleDelete}
                                        className="font-bold bg-transparent border-2 text-red border-red"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </>
    )
}

export default Webhook
