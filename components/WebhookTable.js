import { Menu } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import React, { useEffect, useState } from 'react'
import WebhookModal from './WebhookModal'

export default function WebhookTable() {
    const [initialValues, setInitialvalues] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState('')
    const handleEdit = (initialValues) => {
        setInitialvalues(initialValues)
        setModalType(initialValues.type)
        setModalOpen(true)
    }
    const [webhooks, setWebhooks] = useState([])

    const getWebhooks = async () => {
        const { data } = await supabaseClient.from('squeak_webhook_notifications').select('url, type, id')
        setWebhooks(data)
    }

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
    }, [])

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
                <Menu.Button className="px-4 py-2 rounded-md border border-gray-400 flex items-center space-x-4">
                    <span>Add alert</span>
                    <span>
                        <ChevronDownIcon className="w-4 text-gray-400" />
                    </span>
                </Menu.Button>
                <Menu.Items className="absolute bg-white shadow-md rounded-md z-10">
                    <Menu.Item>
                        <div className="grid">
                            <button
                                onClick={() => {
                                    setModalType('slack')
                                    setModalOpen(true)
                                }}
                                className="font-bold hover:bg-gray-50 transition-colors p-4 text-left"
                            >
                                Slack notification
                            </button>
                            <button
                                onClick={() => {
                                    setModalType('webhook')
                                    setModalOpen(true)
                                }}
                                className="font-bold hover:bg-gray-50 transition-colors p-4 text-left"
                            >
                                Outgoing webhook
                            </button>
                        </div>
                    </Menu.Item>
                </Menu.Items>
            </Menu>
            {webhooks.length > 0 && (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full table-fixed divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                                Type
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                                URL
                                            </th>

                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {webhooks.map(({ type, url, id }) => {
                                            return (
                                                <tr key={id}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {type}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {url}
                                                    </td>

                                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            className="text-orange-500 font-bold"
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
