import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { definitions } from '../@types/supabase'
import type { WebhookValues } from '../@types/types'
import useActiveOrganization from '../util/useActiveOrganization'
import Button from './Button'
import Input from './Input'

type WebhookConfig = definitions['squeak_webhook_config']
type FormValues = Pick<WebhookValues, 'url'>

interface Props {
    onSubmit: () => void
    initialValues: WebhookValues | null
}

const SlackWebhook: React.VoidFunctionComponent<Props> = ({ onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()
    const [saveLoading, setSaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleSave = async ({ url }: FormValues) => {
        setSaveLoading(true)
        if (initialValues) {
            const { error } = await supabaseClient
                .from<WebhookConfig>('squeak_webhook_config')
                .update({ url })
                .match({ id: initialValues.id, organization_id: organizationId })

            addToast(error ? error.message : 'Slack webhook updated', {
                appearance: error ? 'error' : 'success',
            })
        } else {
            const { error } = await supabaseClient
                .from<WebhookConfig>('squeak_webhook_config')
                .insert({ url, type: 'slack', organization_id: organizationId })

            addToast(error ? error.message : 'Slack webhook created', {
                appearance: error ? 'error' : 'success',
            })
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

        await supabaseClient
            .from<WebhookConfig>('squeak_webhook_config')
            .delete()
            .match({ id: initialValues.id, organization_id: organizationId })
        setDeleteLoading(false)
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
                                placeholder="Slack incoming webhook URL"
                            />
                            <div className="flex space-x-2 mt-3">
                                <Button loading={saveLoading} disabled={!isValid} type="submit">
                                    {initialValues ? 'Save' : 'Add'}
                                </Button>
                                {initialValues && (
                                    <Button
                                        loading={deleteLoading}
                                        onClick={handleDelete}
                                        className="bg-transparent text-red font-bold border-2 border-red"
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
