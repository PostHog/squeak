import { Dialog } from '@headlessui/react'
import ImportSlack from './ImportSlack'

export default function ImportModal({ open, setOpen }) {
    return (
        <Dialog className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={() => setOpen(false)}>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="max-w-7xl mx-auto w-full bg-white shadow-md border-md rounded-md relative mt-12 p-5">
                <ImportSlack />
            </div>
        </Dialog>
    )
}
