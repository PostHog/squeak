import { CheckCircleIcon } from '@heroicons/react/outline'
import { Question, Profile, Reply, Prisma } from '@prisma/client'
import groupBy from 'lodash.groupby'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

import type { NextPageWithLayout } from '../@types/types'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Surface from '../components/Surface'
import AdminLayout from '../layout/AdminLayout'
import prisma from '../lib/db'
import dateToDays from '../util/dateToDays'
import dayFormat from '../util/dayFormat'
import getActiveOrganization from '../util/getActiveOrganization'
import getQuestions from '../util/getQuestions'
import withAdminAccess from '../util/withAdminAccess'

type ReplyWithProfile = Pick<Reply, 'body'> & { profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar'> }

interface IQuestion {
    question: Question
    replies: Array<ReplyWithProfile>
}

interface Props {
    results: {
        questions: Array<IQuestion>
        count: number
    }
    start: number
    domain: string | null
}

const QuestionsLayout: React.VoidFunctionComponent<Props> = ({ results, domain, start }) => {
    const { questions } = results

    const grouped = groupBy(questions, (question: IQuestion) => {
        const { created_at } = question.question
        return dateToDays(created_at)
    })

    return (
        <div>
            <h1 className="mb-2">
                Questions <span className="text-[14px] opacity-50 font-semibold">by date</span>
            </h1>
            {questions.length <= 0 ? (
                <Surface className="max-w-[700px]">
                    <h3>No questions yet! </h3>
                    <p>
                        Check back later or <Link href="/slack">import from Slack</Link>.
                    </p>
                </Surface>
            ) : (
                <ul className="grid gap-2">
                    {Object.keys(grouped).map((days) => {
                        return (
                            <li key={days}>
                                <h4 className="text-[14px] opacity-30 m-0 font-bold">{dayFormat(Number(days))}</h4>
                                <ul className="grid gap-4">
                                    {grouped[days].map((question: IQuestion) => {
                                        const [firstReply] = question.replies
                                        const replyCount = question.replies.length - 1
                                        const slackTimestamp = question.question.slack_timestamp

                                        return (
                                            <li key={`question-${question.question.id}`} className="flex space-x-9">
                                                <div className="flex-grow max-w-[700px] relative">
                                                    <Surface>
                                                        {question.question.published && (
                                                            <span className="absolute right-6 top-6" title="Published">
                                                                <CheckCircleIcon className="w-8 text-green-500" />
                                                            </span>
                                                        )}
                                                        <Button
                                                            href={`/question/${question.question.id}`}
                                                            className="bg-white text-left !p-0"
                                                        >
                                                            <h3 className="pr-12 my-0 font-bold text-red">
                                                                {question.question.subject}
                                                            </h3>
                                                        </Button>
                                                        <div className="flex items-center justify-between">
                                                            <ul className="flex items-center space-x-2">
                                                                <li className="text-sm opacity-50 text-inherit">
                                                                    Appears on:
                                                                </li>
                                                                {question.question.slug?.map((slug) => {
                                                                    const url = domain ? new URL(domain).origin : ''
                                                                    const questionLink = url + (slug as string).trim()

                                                                    return (
                                                                        <li key={questionLink} className="pb-0">
                                                                            <a
                                                                                href={questionLink}
                                                                                target="_blank"
                                                                                className="text-sm opacity-50 text-inherit"
                                                                                rel="noreferrer"
                                                                            >
                                                                                {questionLink}
                                                                            </a>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </div>
                                                        <div className="post-content">
                                                            <ReactMarkdown>{firstReply?.body || ''}</ReactMarkdown>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <Button
                                                                href={`/question/${question.question.id}`}
                                                                className="mt-3 font-bold bg-gray-light text-red bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-25"
                                                            >{`${replyCount} ${
                                                                replyCount === 1 ? 'reply' : 'replies'
                                                            }`}</Button>
                                                            {slackTimestamp && (
                                                                <p className="text-[13px] opacity-30">via Slack</p>
                                                            )}
                                                        </div>
                                                    </Surface>
                                                </div>
                                                <div className="flex items-start max-w-[200px] w-full flex-shrink-0 py-8">
                                                    <div className="flex items-center space-x-3">
                                                        {firstReply?.profile?.avatar && (
                                                            <Avatar image={firstReply?.profile?.avatar} />
                                                        )}
                                                        <div className="text-xs opacity-50">
                                                            <p className="font-semibold">{`${
                                                                slackTimestamp
                                                                    ? 'Slack User'
                                                                    : `${firstReply.profile?.first_name} ${firstReply.profile?.last_name}`
                                                            }`}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                        )
                    })}
                </ul>
            )}
            <nav className="flex items-center justify-between py-3" aria-label="Pagination">
                <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                        {/* Showing <span className="font-medium">{start + 1}</span> to{' '}
                        <span className="font-medium">{start + (results.count < 20 ? results.count : 20)}</span> of{' '} */}
                        <span className="font-medium">{results.count}</span> results
                    </p>
                </div>
                <div className="flex justify-between flex-1 space-x-4 sm:justify-end">
                    {start > 0 && <a href={`/questions?start=${start - 20}`}>Previous</a>}
                    {start + 20 < results.count && <a href={`/questions?start=${start + 20}`}>Next</a>}
                </div>
            </nav>
        </div>
    )
}

const Questions: NextPageWithLayout<Props> = ({ results, start, domain }) => {
    return <QuestionsLayout domain={domain} results={results} start={start} />
}

Questions.getLayout = function getLayout(page) {
    return (
        <AdminLayout hideTitle title={'Questions'}>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps(context) {
        const organizationId = await getActiveOrganization(context)
        const start = context.query?.start ? parseInt(context.query?.start as string) : 0
        const config = await prisma.squeakConfig.findFirst({
            where: { organization_id: organizationId },
            select: { company_domain: true },
        })

        if (!config) {
            return {
                props: {
                    error: 'No config found',
                },
            }
        }
        const { company_domain } = config

        try {
            const { data } = await getQuestions(context, { start, organizationId })
            return {
                props: {
                    results: data,
                    start,
                    domain: company_domain,
                },
            }
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return { props: { error: error.message } }
            }
            return { props: { error } }
        }
    },
})

export default Questions
