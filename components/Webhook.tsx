import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import Button from './Button'
import { WebhookValues } from '../@types/types'
import { definitions } from '../@types/supabase'
import useActiveOrganization from '../util/useActiveOrganization'
import { useToasts } from 'react-toast-notifications'

type WebhookConfig = definitions['squeak_webhook_config']
type FormValues = Pick<WebhookValues, 'url'>

interface Props {
    onSubmit: () => void
    initialValues: WebhookValues | null
}

const Webhook: React.VoidFunctionComponent<Props> = ({ onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const handleSave = async ({ url }: FormValues) => {
        if (initialValues) {
            const { error } = await supabaseClient
                .from<WebhookConfig>('squeak_webhook_config')
                .update({ url })
                .match({ id: initialValues.id, organinization_id: organizationId })

            addToast(error ? error.message : 'Webhook updated', {
                appearance: error ? 'error' : 'success',
            })
        } else {
            const { error } = await supabaseClient
                .from<WebhookConfig>('squeak_webhook_config')
                .insert({ url, type: 'webhook', organization_id: organizationId })

            addToast(error ? error.message : 'Webhook created', {
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

export default Webhook
