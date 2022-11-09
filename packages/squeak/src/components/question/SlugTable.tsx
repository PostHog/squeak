import React, { useCallback, useEffect, useState } from 'react'

import SlugModal from './SlugModal'
import Button from '../Button'
import { getQuestion } from '../../lib/api'
import { useUser } from '../../contexts/user'
interface Props {
    questionId: number
}

const SlugTable: React.VoidFunctionComponent<Props> = ({ questionId }) => {
    const { status } = useUser()
    const [slugs, setSlugs] = useState<string[]>([])
    const [initialValues, setInitialValues] = useState<{ slugs: Array<string>; slug: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const isUserLoading = status === 'loading'

    const getSlugsForQuestion = useCallback(async () => {
        if (!isUserLoading) {
            const { body: data } = await getQuestion(questionId, 'slug')
            setSlugs(data?.slug || [])
            setInitialValues({
                slugs: data?.slug || [],
                slug: '',
            })
        }
    }, [isUserLoading, questionId])

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
                <div className="flex flex-col mt-4">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 table-fixed">
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {slugs.map((slug) => {
                                            return (
                                                <tr key={slug}>
                                                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {slug}
                                                    </td>

                                                    <td className="py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                                                        <button
                                                            className="font-bold text-accent-light"
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
