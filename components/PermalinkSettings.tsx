import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { updateSqueakConfig } from '../lib/api'
import Input from './Input'
import Toggle from './Toggle'

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
    const [loading, setLoading] = useState(false)
    const [permalinksEnabled, setPermalinksEnabled] = useState(other.permalinksEnabled)

    const handleSaveNotifications = async (values: InitialValues) => {
        setLoading(true)

        try {
            await updateSqueakConfig({ permalink_base: values.permalinkBase })
            addToast('Permalink base saved', { appearance: 'success' })
        } catch (error) {
            if (error instanceof Error) {
                addToast(error.message, { appearance: 'error' })
            } else {
                addToast(error as string, { appearance: 'error' })
            }
        }

        setLoading(false)
    }

    const initialValues: InitialValues = {
        permalinkBase: permalinkBase,
    }

    const setPermalinks = async (enabled: boolean) => {
        setPermalinksEnabled(enabled)
        try {
            await updateSqueakConfig({ permalinks_enabled: enabled })
            addToast(`Permalinks ${enabled ? 'enabled' : 'disabled'}`, {
                appearance: 'success',
            })
        } catch (error) {
            if (error instanceof Error) {
                addToast(error.message, { appearance: 'error' })
            } else {
                addToast(error as string, { appearance: 'error' })
            }
        }
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

                                <div className="flex items-center mt-4 space-x-6">
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
