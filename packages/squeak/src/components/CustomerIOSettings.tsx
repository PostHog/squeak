import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { updateSqueakConfig } from '../lib/api'
import { ApiResponseError } from '../lib/api/client'
import Input from './Input'

interface Props {
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
}

interface InitialValues {
    customer_io_app_api_key: string
    customer_io_tracking_api_key: string
    customer_io_broadcast_id?: number | null | undefined
    customer_io_site_id?: string
}

const CustomerIOSettings: React.VoidFunctionComponent<Props & InitialValues> = ({
    customer_io_app_api_key,
    customer_io_tracking_api_key,
    customer_io_broadcast_id,
    customer_io_site_id,
    actionButtons,
}) => {
    const { addToast } = useToasts()
    const [loading, setLoading] = useState(false)

    const handleSaveSettings = async (values: InitialValues) => {
        const { customer_io_app_api_key, customer_io_tracking_api_key, customer_io_broadcast_id, customer_io_site_id } =
            values
        setLoading(true)

        try {
            await updateSqueakConfig({
                customer_io_app_api_key,
                customer_io_tracking_api_key,
                customer_io_broadcast_id: Number(customer_io_broadcast_id),
                customer_io_site_id,
            })
            addToast('Customer.io settings saved', { appearance: 'success' })
        } catch (error) {
            if (error instanceof ApiResponseError) {
                addToast(error.message, { appearance: 'error' })
            }
        } finally {
            setLoading(false)
        }
    }

    const initialValues: InitialValues = {
        customer_io_app_api_key,
        customer_io_tracking_api_key,
        customer_io_broadcast_id,
        customer_io_site_id,
    }

    return (
        <Formik validateOnMount initialValues={initialValues} onSubmit={handleSaveSettings}>
            {({ isValid }) => {
                return (
                    <Form className="mt-6">
                        <Input
                            label="Customer.io app API key"
                            id="customer_io_app_api_key"
                            name="customer_io_app_api_key"
                            placeholder="Customer.io app API key"
                        />
                        <Input
                            label="Customer.io tracking API key"
                            id="customer_io_tracking_api_key"
                            name="customer_io_tracking_api_key"
                            placeholder="Customer.io tracking API key"
                        />
                        <Input
                            label="Customer.io site ID"
                            id="customer_io_site_id"
                            name="customer_io_site_id"
                            placeholder="Customer.io site ID"
                        />
                        <Input
                            label="Customer.io broadcast ID"
                            id="customer_io_broadcast_id"
                            name="customer_io_broadcast_id"
                            placeholder="Customer.io broadcast ID"
                        />

                        <div className="flex items-center mt-4 space-x-6">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default CustomerIOSettings
