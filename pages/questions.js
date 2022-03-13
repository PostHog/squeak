import { CheckIcon } from '@heroicons/react/outline'
import { supabaseClient, supabaseServerClient, withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useLayoutEffect, useRef, useState } from 'react'
import tinytime from 'tinytime'
import AdminLayout from '../layout/AdminLayout'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const QuestionsTable = ({ questions, start }) => {
    const checkbox = useRef()
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState([])
    const router = useRouter()

    useLayoutEffect(() => {
        const isIndeterminate = selectedQuestions.length > 0 && selectedQuestions.length < questions.questions.length
        setChecked(selectedQuestions.length === questions.questions.length)
        setIndeterminate(isIndeterminate)
        checkbox.current.indeterminate = isIndeterminate
    }, [selectedQuestions])

    function toggleAll() {
        setSelectedQuestions(checked || indeterminate ? [] : questions.questions)
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    const template = tinytime('{Mo}/{DD}/{YYYY}', { padMonth: true })

    const updatePublished = async (published) => {
        await Promise.all(
            selectedQuestions.map((question) => {
                return supabaseClient.from('squeak_messages').update({ published }).match({ id: question.question.id })
            })
        )
        router.reload()
    }

    return (
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
                                    Publish all
                                </button>
                                <button
                                    onClick={() => updatePublished(false)}
                                    type="button"
                                    className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Unpublish all
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
                                    {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Edit</span>
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {questions?.questions.map((question) => {
                                    const {
                                        question: { subject, created_at, slug, published },
                                        replies,
                                    } = question
                                    return (
                                        <tr
                                            key={question.id}
                                            className={selectedQuestions.includes(question) ? 'bg-gray-50' : undefined}
                                        >
                                            <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                {selectedQuestions.includes(question) && (
                                                    <div className="absolute inset-y-0 left-0 w-0.5 bg-orange-600" />
                                                )}
                                                <input
                                                    type="checkbox"
                                                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 sm:left-6"
                                                    value={question.id}
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
                                                {template.render(new Date(created_at))}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {replies?.length - 1 || 0}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {slug}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {published && <CheckIcon className="w-6 text-green-500" />}
                                            </td>
                                            {/* <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <a href="#" className="text-orange-600 hover:text-orange-900">
                                                    Edit
                                                </a>
                                            </td> */}
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
                        <span className="font-medium">{start + 20}</span> of{' '}
                        <span className="font-medium">{questions.count}</span> results
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
                    {start + 20 < questions.count && (
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
    )
}

const Questions = ({ questions = [], start }) => {
    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <QuestionsTable questions={questions} start={start} />
        </div>
    )
}

Questions.getLayout = function getLayout(page) {
    return <AdminLayout title={'Questions'}>{page}</AdminLayout>
}

export const getServerSideProps = withAuthRequired({
    redirectTo: '/',
    async getServerSideProps(context) {
        const start = context.query?.start ? parseInt(context.query?.start) : 0
        const end = start + 19
        const getQuestions = async () => {
            const questions = await supabaseServerClient(context)
                .from('squeak_messages')
                .select('subject, id, slug, created_at, published', { count: 'exact' })
                .order('created_at')
                .range(start, end)
            return {
                questions: await Promise.all(
                    questions?.data.map((question) => {
                        return supabaseServerClient(context)
                            .from('squeak_replies')
                            .select(`id`)
                            .eq('message_id', question.id)
                            .order('created_at')
                            .then((data) => ({
                                question,
                                replies: data?.data,
                            }))
                    })
                ),
                count: questions.count,
            }
        }

        const questions = await getQuestions()

        return {
            props: {
                questions,
                start,
            },
        }
    },
})

export default Questions
