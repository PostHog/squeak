import { Menu } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import React, { useCallback, useEffect, useState } from 'react'

import WebhookModal from './WebhookModal'
import { WebhookValues } from '../@types/types'
import { fetchWebhooks } from '../lib/api'
import { FetchWebhooksPayload } from '../pages/api/webhooks'
import { useUser } from '../contexts/user'

interface Props {}

const WebhookTable: React.VoidFunctionComponent<Props> = () => {
    const { isLoading: isUserLoading } = useUser()

    const [initialValues, setInitialvalues] = useState<WebhookValues | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState<string>('')

    const handleEdit = (initialValues: WebhookValues) => {
        setInitialvalues(initialValues)
        setModalType(initialValues.type)
        setModalOpen(true)
    }
    const [webhooks, setWebhooks] = useState<FetchWebhooksPayload[]>([])

    const getWebhooks = useCallback(async () => {
        if (!isUserLoading) {
            const { body: data } = await fetchWebhooks()
            setWebhooks(data ?? [])
        }
    }, [isUserLoading])

    const handleWebhookSubmit = () => {
        getWebhooks()
        setInitialvalues(null)
        setModalOpen(false)
    }

    const handleClose = () => {
        setModalOpen(false)
        setInitialvalues(null)
    }

    useEffect(() => {
        getWebhooks()
    }, [getWebhooks])

    return (
        <>
            <WebhookModal
                type={modalType}
                onClose={handleClose}
                initialValues={initialValues}
                onSubmit={handleWebhookSubmit}
                open={modalOpen}
            />
            <Menu>
                <Menu.Button className="flex items-center px-4 py-2 space-x-4 border rounded-md border-gray-light-400">
                    <span>Add alert</span>
                    <span>
                        <ChevronDownIcon className="w-4 text-gray-400" />
                    </span>
                </Menu.Button>
                <Menu.Items className="absolute z-10 bg-white rounded-md shadow-md">
                    <Menu.Item>
                        <div className="grid">
                            <button
                                onClick={() => {
                                    setModalType('slack')
                                    setModalOpen(true)
                                }}
                                className="p-4 font-bold text-left transition-colors hover:bg-gray-50"
                            >
                                Slack notification
                            </button>
                            <button
                                onClick={() => {
                                    setModalType('webhook')
                                    setModalOpen(true)
                                }}
                                className="p-4 font-bold text-left transition-colors hover:bg-gray-50"
                            >
                                Outgoing webhook
                            </button>
                        </div>
                    </Menu.Item>
                </Menu.Items>
            </Menu>

            {webhooks.length > 0 && (
                <div className="flex flex-col mt-8">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 table-fixed">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-primary-light"
                                            >
                                                Type
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-primary-light"
                                            >
                                                URL
                                            </th>

                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {webhooks.map(({ type, url, id }) => {
                                            return (
                                                <tr key={String(id)}>
                                                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {type}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {url}
                                                    </td>

                                                    <td className="py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                                                        <button
                                                            className="font-bold text-accent-light"
                                                            onClick={() => handleEdit({ url, type, id })}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default WebhookTable
