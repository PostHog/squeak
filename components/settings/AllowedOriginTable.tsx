import React, { useCallback, useEffect, useState } from 'react'
import AllowedOriginModal from './AllowedOriginModal'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../@types/supabase'
import { useUser } from '@supabase/supabase-auth-helpers/react'

type Config = definitions['squeak_config']

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
            await supabaseClient
                .from<Config>('squeak_config')
                .select('allowed_origins')
                .eq('organization_id', organizationId)
                .limit(1)
                .single()
                .then(({ data }) => {
                    setAllowedOrigins((data?.allowed_origins as Array<string>) || [])
                    setInitialValues({
                        allowedOrigins: (data?.allowed_origins as Array<string>) || [],
                        allowedOrigin: '',
                    })
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

            <button className="px-4 py-2 rounded-md border border-gray-light-400" onClick={() => setModalOpen(true)}>
                <span>Add allowed origin</span>
            </button>

            {allowedOrigins.length > 0 && (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full table-fixed divide-y divide-gray-300">
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
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {allowedOrigins.map((allowedOrigin) => {
                                            return (
                                                <tr key={allowedOrigin}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {allowedOrigin}
                                                    </td>

                                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            className="text-accent-light font-bold"
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
