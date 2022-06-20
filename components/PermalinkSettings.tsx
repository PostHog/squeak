import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import type { definitions } from '../@types/supabase'
import useActiveOrganization from '../hooks/useActiveOrganization'
import Input from './Input'
import Toggle from './Toggle'

type Config = definitions['squeak_config']

interface Props {
    permalinkBase: string
    companyDomain: string
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
    permalinksEnabled: boolean
}

interface InitialValues {
    permalinkBase: string
}

const PermalinkSettings: React.VoidFunctionComponent<Props> = ({
    permalinkBase,
    companyDomain,
    actionButtons,
    ...other
}) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()
    const [loading, setLoading] = useState(false)
    const [permalinksEnabled, setPermalinksEnabled] = useState(other.permalinksEnabled)

    const handleSaveNotifications = async (values: InitialValues) => {
        setLoading(true)

        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                permalink_base: values.permalinkBase,
            })
            .match({ organization_id: organizationId })

        addToast(error ? error.message : 'Permalink base saved', {
            appearance: error ? 'error' : 'success',
        })

        setLoading(false)
    }

    const initialValues: InitialValues = {
        permalinkBase: permalinkBase,
    }

    const setPermalinks = async (enabled: boolean) => {
        setPermalinksEnabled(enabled)
        const { error } = await supabaseClient
            .from('squeak_config')
            .update({
                permalinks_enabled: enabled,
            })
            .match({ organization_id: organizationId })
        addToast(error ? error.message : `Permalinks ${enabled ? 'enabled' : 'disabled'}`, {
            appearance: error ? 'error' : 'success',
        })
    }

    return (
        <>
            <Toggle
                className="pt-4"
                checked={permalinksEnabled}
                setChecked={() => setPermalinks(!permalinksEnabled)}
                label="Enable permalinks"
            />
            {permalinksEnabled && (
                <Formik
                    validateOnMount
                    validate={(values) => {
                        const errors: {
                            permalinkBase?: string
                        } = {}
                        if (!values.permalinkBase) {
                            errors.permalinkBase = 'Required'
                        }
                        return errors
                    }}
                    initialValues={initialValues}
                    onSubmit={handleSaveNotifications}
                >
                    {({ isValid }) => {
                        return (
                            <Form className="mt-6">
                                <Input
                                    base={companyDomain + '/'}
                                    label="Permalink base"
                                    id="permalinkBase"
                                    name="permalinkBase"
                                    placeholder="Permalink base"
                                />

                                <div className="flex space-x-6 items-center mt-4">
                                    {actionButtons(isValid, loading)}
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            )}
        </>
    )
}

export default PermalinkSettings
