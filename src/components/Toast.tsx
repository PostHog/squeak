import { ToastProps } from 'react-toast-notifications'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { XIcon } from '@heroicons/react/solid'

const Toast: React.FunctionComponent<ToastProps> = ({ children, appearance, onDismiss }) => (
    <div aria-live="assertive" className="w-96 flex items-end px-3 py-2 sm:p-2 sm:items-start">
        <div className="w-full flex flex-col items-center space-y-2 sm:items-end">
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {appearance === 'success' && (
                                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                            )}
                            {appearance === 'error' && (
                                <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                            )}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">{children}</div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => {
                                    onDismiss()
                                }}
                            >
                                <span className="sr-only">Close</span>
                                <XIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default Toast
