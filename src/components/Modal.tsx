import { Dialog } from '@headlessui/react'

interface Props {
    open?: boolean
    onClose: () => void
}

const Modal: React.FunctionComponent<Props> = ({ children, open = false, onClose }) => {
    return (
        <Dialog className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={onClose}>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="max-w-md w-full bg-white shadow-md rounded-md p-4 relative mx-auto my-12">{children}</div>
        </Dialog>
    )
}

export default Modal
