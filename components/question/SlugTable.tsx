import React, { useCallback, useEffect, useState } from 'react'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../@types/supabase'
import SlugModal from './SlugModal'
import Button from '../Button'

type Question = definitions['squeak_messages']

interface Props {
    questionId: number
}

const SlugTable: React.VoidFunctionComponent<Props> = ({ questionId }) => {
    const { isLoading: isUserLoading } = useUser()
    const [slugs, setSlugs] = useState<string[]>([])
    const [initialValues, setInitialValues] = useState<{ slugs: Array<string>; slug: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const getSlugsForQuestion = useCallback(async () => {
        if (!isUserLoading) {
            await supabaseClient
                .from<Question>('squeak_messages')
                .select('slug')
                .eq('organization_id', organizationId)
                .eq('id', questionId)
                .limit(1)
                .single()
                .then(({ data }) => {
                    setSlugs((data?.slug as Array<string>) || [])
                    setInitialValues({
                        slugs: (data?.slug as Array<string>) || [],
                        slug: '',
                    })
                })
        }
    }, [isUserLoading, organizationId, questionId])

    const handleSubmit = () => {
        getSlugsForQuestion()
        setModalOpen(false)
        setInitialValues({ slugs, slug: '' })
    }

    const handleEdit = (slug: string) => {
        setInitialValues({ slugs, slug })
        setModalOpen(true)
    }

    const handleClose = () => {
        setModalOpen(false)
        setInitialValues({ slugs, slug: '' })
    }

    useEffect(() => {
        getSlugsForQuestion()
    }, [getSlugsForQuestion])

    return (
        <>
            <SlugModal
                questionId={questionId}
                open={modalOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                initialValues={initialValues}
            />

            {slugs.length > 0 && (
                <div className="mt-4 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full table-fixed divide-y divide-gray-300">
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {slugs.map((slug) => {
                                            return (
                                                <tr key={slug}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {slug}
                                                    </td>

                                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            className="text-accent-light font-bold"
                                                            onClick={() => handleEdit(slug)}
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

            <Button className="mt-8" onClick={() => setModalOpen(true)}>
                <span>Add page</span>
            </Button>
        </>
    )
}

export default SlugTable
