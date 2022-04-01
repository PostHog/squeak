import { Dialog } from '@headlessui/react'
import Webhook from './Webhook'
import SlackWebhook from './SlackWebhook'
import { WebhookValues } from '../@types/types'

interface Props {
    type?: string
    open?: boolean
    initialValues: WebhookValues | null
    onSubmit: () => void
    onClose: () => void
}

const WebhookModal: React.VoidFunctionComponent<Props> = ({
    type = 'webhook',
    open = false,
    onSubmit,
    initialValues,
    onClose,
}) => {
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

export default WebhookModal
