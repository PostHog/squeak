import Webhook from './Webhook'
import SlackWebhook from './SlackWebhook'
import Modal from './Modal'

import type { WebhookValues } from '../@types/types'

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
        <Modal onClose={onClose} open={open}>
            {
                {
                    webhook: <Webhook initialValues={initialValues} onSubmit={onSubmit} />,
                    slack: <SlackWebhook initialValues={initialValues} onSubmit={onSubmit} />,
                }[type]
            }
        </Modal>
    )
}

export default WebhookModal
