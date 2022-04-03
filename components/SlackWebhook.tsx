import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { Field, Form, Formik } from 'formik'
import Button from './Button'
import type { WebhookValues } from '../@types/types'
import { definitions } from '../@types/supabase'
import useActiveOrganization from '../util/useActiveOrganization'
import { useToasts } from 'react-toast-notifications'

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

    const handleSave = async ({ url }: FormValues) => {
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

        onSubmit()
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        if (!initialValues) {
            return
        }

        await supabaseClient
            .from<WebhookConfig>('squeak_webhook_config')
            .delete()
            .match({ id: initialValues.id, organization_id: organizationId })
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

export default SlackWebhook
