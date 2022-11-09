import { Profile, Question } from '@prisma/client'
import Link from 'next/link'
import dateToDays from '../util/dateToDays'
import dayFormat from '../util/dayFormat'

export type QuestionTableRow = {
    question: Question
    profile: Profile | null
    numReplies?: number
}

type QuestionsTableProps = {
    questions: QuestionTableRow[]
    start: number
    perPage: number
    total: number
    nextPage?: () => void
    prevPage?: () => void
}

export const QuestionsTable: React.FC<QuestionsTableProps> = ({
    questions,
    start,
    perPage,
    nextPage,
    prevPage,
    total,
}) => {
    return (
        <div className="">
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 font-bold"
                                        >
                                            {total} {total === 1 ? 'Question' : 'Questions'}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Page
                                        </th>
                                        <th
                                            scope="col"
                                            className="pl-3 pr-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Replies
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {questions.map(({ question, profile, numReplies }) => {
                                        const createdAt = dateToDays(question.created_at)
                                        return (
                                            <tr key={question.id.toString()}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-4">
                                                    <div className="flex items-center space-x-3">
                                                        {question.resolved ? (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="w-4 h-4 text-green-600"
                                                            >
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                                <polyline points="22 4 12 14.01 9 11.01" />
                                                            </svg>
                                                        ) : (
                                                            <div className="w-4 h-4"></div>
                                                        )}
                                                        <div>
                                                            <Link href={`/question/${question.id.toString()}`}>
                                                                <a className="font-bold text-[16px]">
                                                                    {question.subject}
                                                                </a>
                                                            </Link>

                                                            {profile && (
                                                                <div className="text-gray-600">
                                                                    Posted{' '}
                                                                    {createdAt === 0
                                                                        ? 'today'
                                                                        : createdAt === 1
                                                                        ? '1 day ago'
                                                                        : `${createdAt} days ago`}{' '}
                                                                    by{' '}
                                                                    <Link href={`/profiles/${profile.id}`}>
                                                                        <a className="text-gray-800">
                                                                            {profile.first_name} {profile.last_name}
                                                                        </a>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {question.slug[0]}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {numReplies && (
                                                        <div className="flex items-center space-x-2">
                                                            <span>{numReplies - 1}</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="w-4 h-4"
                                                            >
                                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <nav
                                className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
                                aria-label="Pagination"
                            >
                                <div className="hidden sm:block">
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{start + 1}</span> to{' '}
                                        <span className="font-medium">{start + perPage}</span> of {total}{' '}
                                        {total === 1 ? 'question' : 'questions'}
                                    </p>
                                </div>
                                {prevPage && nextPage ? (
                                    <div className="flex flex-1 justify-between sm:justify-end">
                                        <button
                                            onClick={prevPage}
                                            disabled={start === 0}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={nextPage}
                                            disabled={questions.length < perPage}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                ) : null}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuestionsTable
