import React, { useCallback, useEffect, useState } from 'react'
import AllowedOriginModal from './AllowedOriginModal'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { getConfig } from '../../lib/api'

interface Props {}

const AllowedOriginTable: React.VoidFunctionComponent<Props> = () => {
    const { isLoading: isUserLoading } = useUser()
    const [allowedOrigins, setAllowedOrigins] = useState<string[]>([])
    const [initialValues, setInitialValues] = useState<{ allowedOrigins: string[]; allowedOrigin: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const getAllowedOrigins = useCallback(async () => {
        if (!isUserLoading) {
            const { body: data } = await getConfig()
            setAllowedOrigins(data?.allowed_origins || [])
            setInitialValues({
                allowedOrigins: data?.allowed_origins || [],
                allowedOrigin: '',
            })
        }
    }, [isUserLoading, organizationId])

    const handleSubmit = () => {
        getAllowedOrigins()
        setModalOpen(false)
        setInitialValues({ allowedOrigins, allowedOrigin: '' })
    }

    const handleEdit = (allowedOrigin: string) => {
        setInitialValues({ allowedOrigins, allowedOrigin })
        setModalOpen(true)
    }

    const handleClose = () => {
        setModalOpen(false)
        setInitialValues({ allowedOrigins, allowedOrigin: '' })
    }

    useEffect(() => {
        getAllowedOrigins()
    }, [getAllowedOrigins])

    return (
        <>
            <AllowedOriginModal
                open={modalOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                initialValues={initialValues}
            />

            <button className="px-4 py-2 border rounded-md border-gray-light-400" onClick={() => setModalOpen(true)}>
                <span>Add allowed origin</span>
            </button>

            {allowedOrigins.length > 0 && (
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
                                                Origin
                                            </th>

                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allowedOrigins.map((allowedOrigin) => {
                                            return (
                                                <tr key={allowedOrigin}>
                                                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {allowedOrigin}
                                                    </td>

                                                    <td className="py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                                                        <button
                                                            className="font-bold text-accent-light"
                                                            onClick={() => handleEdit(allowedOrigin)}
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

export default AllowedOriginTable
