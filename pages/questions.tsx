import { CheckIcon } from '@heroicons/react/outline'
import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useLayoutEffect, useRef, useState } from 'react'
import tinytime from 'tinytime'
import type { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'
import withAdminAccess from '../util/withAdminAccess'
import type { GetStaticPropsResult } from 'next'
import getActiveOrganization from '../util/getActiveOrganization'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

interface Question {
    question: Message
    replies: Array<Reply>
}

interface Props {
    results: {
        questions: Array<Question>
        count: number
    }
    start: number
}

const QuestionsTable: React.VoidFunctionComponent<Props> = ({ results, start }) => {
    const checkbox = useRef<HTMLInputElement>(null)
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<Array<Question>>([])
    const router = useRouter()

    useLayoutEffect(() => {
        const isIndeterminate = selectedQuestions.length > 0 && selectedQuestions.length < results.questions.length
        setChecked(selectedQuestions.length === results.questions.length)
        setIndeterminate(isIndeterminate)

        if (checkbox.current) {
            checkbox.current.indeterminate = isIndeterminate
        }
    }, [results.questions.length, selectedQuestions])

    function toggleAll() {
        setSelectedQuestions(checked || indeterminate ? [] : results.questions)
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    const template = tinytime('{Mo}/{DD}/{YYYY}', { padMonth: true })

    const updatePublished = async (published: boolean) => {
        await Promise.all(
            selectedQuestions.map((question) => {
                return supabaseClient.from('squeak_messages').update({ published }).match({ id: question.question.id })
            })
        )
        router.reload()
    }

    return (
        <>
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            {selectedQuestions.length > 0 && (
                                <div className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                                    <button
                                        onClick={() => updatePublished(true)}
                                        type="button"
                                        className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        Publish selected
                                    </button>
                                    <button
                                        onClick={() => updatePublished(false)}
                                        type="button"
                                        className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        Unpublish selected
                                    </button>
                                </div>
                            )}
                            <table className="min-w-full table-fixed divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                                            <input
                                                type="checkbox"
                                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 sm:left-6"
                                                ref={checkbox}
                                                checked={checked}
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th
                                            scope="col"
                                            className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Subject
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Replies
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Slug
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Published
                                        </th>
                                        <th
                                            scope="col"
                                            className="sr-only px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            View
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {results?.questions.map((question) => {
                                        const {
                                            question: { id, subject, created_at, slug, published },
                                            replies,
                                        } = question
                                        const replyCount = replies.length
                                        return (
                                            <tr
                                                key={id}
                                                className={
                                                    selectedQuestions.includes(question) ? 'bg-gray-50' : undefined
                                                }
                                            >
                                                <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                    {selectedQuestions.includes(question) && (
                                                        <div className="absolute inset-y-0 left-0 w-0.5 bg-orange-600" />
                                                    )}
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 sm:left-6"
                                                        value={id}
                                                        checked={selectedQuestions.includes(question)}
                                                        onChange={(e) =>
                                                            setSelectedQuestions(
                                                                e.target.checked
                                                                    ? [...selectedQuestions, question]
                                                                    : selectedQuestions.filter((q) => q !== question)
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td
                                                    className={classNames(
                                                        'whitespace-nowrap py-4 pr-3 text-sm font-medium max-w-[200px] overflow-hidden',
                                                        selectedQuestions.includes(question)
                                                            ? 'text-orange-600'
                                                            : 'text-gray-900'
                                                    )}
                                                >
                                                    {subject}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {created_at ? template.render(new Date(created_at)) : 'N/A'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {replyCount > 0 ? replyCount - 1 : 0}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {slug}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {published && <CheckIcon className="w-6 text-green-500" />}
                                                </td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link href={`/question/${id}`}>View</Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <nav
                    className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                    aria-label="Pagination"
                >
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{start + 1}</span> to{' '}
                            <span className="font-medium">{start + (results.count < 20 ? results.count : 20)}</span> of{' '}
                            <span className="font-medium">{results.count}</span> results
                        </p>
                    </div>
                    <div className="flex-1 flex justify-between sm:justify-end">
                        {start > 0 && (
                            <a
                                href={`/questions?start=${start - 20}`}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Previous
                            </a>
                        )}
                        {start + 20 < results.count && (
                            <a
                                href={`/questions?start=${start + 20}`}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Next
                            </a>
                        )}
                    </div>
                </nav>
            </div>
        </>
    )
}

const Questions: NextPageWithLayout<Props> = ({ results, start }) => {
    return <QuestionsTable results={results} start={start} />
}

Questions.getLayout = function getLayout(page) {
    return <AdminLayout title={'Questions'}>{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const organizationId = await getActiveOrganization(context)

        const start = context.query?.start ? parseInt(context.query?.start as string) : 0
        const end = start + 19
        const getQuestions = async () => {
            const { data: questions, count } = await supabaseServerClient(context)
                .from<Message>('squeak_messages')
                .select('subject, id, slug, created_at, published', { count: 'exact' })
                .order('created_at')
                .eq('organization_id', organizationId)
                .range(start, end)

            return {
                questions: await Promise.all(
                    (questions || []).map((question) => {
                        return supabaseServerClient(context)
                            .from<Reply>('squeak_replies')
                            .select(`id`)
                            .eq('message_id', question.id)
                            .eq('organization_id', organizationId)
                            .order('created_at')
                            .then((data) => ({
                                question,
                                replies: data?.data || [],
                            }))
                    })
                ),
                count: count ?? 0,
            }
        }

        const results = await getQuestions()

        return {
            props: {
                results,
                start,
            },
        }
    },
})

export default Questions
