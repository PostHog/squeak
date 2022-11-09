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
    cloudinary_cloud_name: string
    cloudinary_api_key: string
    cloudinary_api_secret: string
}

const ImageSettings: React.VoidFunctionComponent<Props & InitialValues> = ({
    cloudinary_cloud_name,
    cloudinary_api_key,
    cloudinary_api_secret,
    actionButtons,
}) => {
    const { addToast } = useToasts()
    const [loading, setLoading] = useState(false)

    const handleSaveImageSettings = async (values: InitialValues) => {
        const { cloudinary_api_key, cloudinary_api_secret, cloudinary_cloud_name } = values
        setLoading(true)

        console.log(values)

        try {
            await updateSqueakConfig({
                cloudinary_api_key,
                cloudinary_api_secret,
                cloudinary_cloud_name,
            })
            addToast('Image settings saved', { appearance: 'success' })
        } catch (error) {
            if (error instanceof ApiResponseError) {
                addToast(error.message, { appearance: 'error' })
            }
        } finally {
            setLoading(false)
        }
    }

    const initialValues: InitialValues = {
        cloudinary_api_key,
        cloudinary_api_secret,
        cloudinary_cloud_name,
    }

    return (
        <Formik validateOnMount initialValues={initialValues} onSubmit={handleSaveImageSettings}>
            {({ isValid }) => {
                return (
                    <Form className="mt-6">
                        <Input
                            label="Cloudinary cloud name"
                            id="cloudinary_cloud_name"
                            name="cloudinary_cloud_name"
                            placeholder="Cloudinary cloud name"
                        />
                        <Input
                            label="Cloudinary API key"
                            id="cloudinary_api_key"
                            name="cloudinary_api_key"
                            placeholder="Cloudinary API key"
                        />
                        <Input
                            label="Cloudinary API secret"
                            id="cloudinary_api_secret"
                            name="cloudinary_api_secret"
                            placeholder="Cloudinary API secret"
                        />

                        <div className="flex items-center mt-4 space-x-6">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default ImageSettings
