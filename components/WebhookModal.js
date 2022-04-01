import { Dialog } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import Button from './Button'

const Webhook = ({ onSubmit, initialValues }) => {
    const handleSave = async ({ url }) => {
        if (initialValues) {
            await supabaseClient.from('squeak_webhook_notifications').update({ url }).match({ id: initialValues.id })
        } else {
            await supabaseClient.from('squeak_webhook_notifications').insert({ url, type: 'webhook' })
        }

        onSubmit()
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        await supabaseClient.from('squeak_webhook_notifications').delete().match({ id: initialValues.id })
        onSubmit()
    }
    return (
        <>
            <h3 className="mb-4 text-xl">Outgoing webhook</h3>
            <Formik
                validateOnMount
                validate={(values) => {
                    const errors = {}
                    if (!values.url) {
                        errors.url = 'Required'
                    }
                    return errors
                }}
                initialValues={{ url: initialValues?.url }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <label htmlFor="url">Webhook URL</label>
                            <Field id="url" name="url" placeholder="Webhook URL" />
                            <div className="flex space-x-2 mt-3">
                                <Button disabled={!isValid} type="submit">
                                    {initialValues ? 'Save' : 'Add'}
                                </Button>
                                {initialValues && (
                                    <Button onClick={handleDelete} className="bg-red-500">
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

const SlackWebhook = ({ onSubmit, initialValues }) => {
    const handleSave = async ({ url }) => {
        if (initialValues) {
            await supabaseClient.from('squeak_webhook_notifications').update({ url }).match({ id: initialValues.id })
        } else {
            await supabaseClient.from('squeak_webhook_notifications').insert({ url, type: 'slack' })
        }

        onSubmit()
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        await supabaseClient.from('squeak_webhook_notifications').delete().match({ id: initialValues.id })
        onSubmit()
    }
    return (
        <>
            <h3 className="mb-4 text-xl flex items-center space-x-2">
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
                    const errors = {}
                    if (!values.url) {
                        errors.url = 'Required'
                    }
                    return errors
                }}
                initialValues={{ url: initialValues?.url }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <label htmlFor="url">Slack incoming webhook URL</label>
                            <Field id="url" name="url" placeholder="Slack incoming webhook URL" />
                            <div className="flex space-x-2 mt-3">
                                <Button disabled={!isValid} type="submit">
                                    {initialValues ? 'Save' : 'Add'}
                                </Button>
                                {initialValues && (
                                    <Button onClick={handleDelete} className="bg-red-500">
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

export default function WebhookModal({ type = 'webhook', open = false, onSubmit, initialValues, onClose }) {
    return (
        <Dialog className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={onClose}>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="max-w-md w-full bg-white shadow-md rounded-md p-4 relative mx-auto my-12">
                {
                    {
                        webhook: <Webhook initialValues={initialValues} onSubmit={onSubmit} />,
                        slack: <SlackWebhook initialValues={initialValues} onSubmit={onSubmit} />,
                    }[type]
                }
            </div>
        </Dialog>
    )
}
