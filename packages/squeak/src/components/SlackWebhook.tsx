import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'

import type { WebhookValues } from '../@types/types'
import Button from './Button'
import Input from './Input'
import { createWebhook, deleteWebhook, updateWebhook } from '../lib/api'
import { ApiResponseError } from '../lib/api/client'

type FormValues = Pick<WebhookValues, 'url'>

interface Props {
    onSubmit: () => void
    initialValues: WebhookValues | null
}

const SlackWebhook: React.VoidFunctionComponent<Props> = ({ onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const [saveLoading, setSaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleSave = async ({ url }: FormValues) => {
        setSaveLoading(true)
        if (initialValues) {
            try {
                await updateWebhook(initialValues.id, { url })
                addToast('Slack webhook updated', { appearance: 'success' })
            } catch (err) {
                if (err instanceof ApiResponseError) {
                    addToast(err.message, { appearance: 'error' })
                }
            }
        } else {
            try {
                await createWebhook({
                    type: 'slack',
                    url,
                })
                addToast('Slack webhook created', { appearance: 'success' })
            } catch (err) {
                if (err instanceof ApiResponseError) {
                    addToast(err.message, { appearance: 'error' })
                }
            }
        }
        setSaveLoading(false)
        onSubmit()
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteLoading(true)
        if (!initialValues) {
            return
        }

        await deleteWebhook(initialValues.id)
        setDeleteLoading(false)
        onSubmit()
    }
    return (
        <>
            <h3 className="flex items-center mb-4 space-x-2 text-xl">
                <span>Slack notification</span>
                <span>
                    <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noreferrer">
                        <QuestionMarkCircleIcon className="w-4 text-gray-400" />
                    </a>
                </span>
            </h3>

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
                            <Input
                                label="Slack incoming webhook URL"
                                id="url"
                                name="url"
                                type="url"
                                placeholder="Slack incoming webhook URL"
                            />
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

export default SlackWebhook
