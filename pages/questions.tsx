import { CheckCircleIcon } from '@heroicons/react/outline'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Surface from '../components/Surface'
import AdminLayout from '../layout/AdminLayout'
import getActiveOrganization from '../util/getActiveOrganization'
import getQuestions from '../util/getQuestions'
import withAdminAccess from '../util/withAdminAccess'

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
    domain: string
}

const QuestionsLayout: React.VoidFunctionComponent<Props> = ({ results, domain, start }) => {
    const { questions } = results
    return (
        <div>
            <h1 className=" mb-6">
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
                <ul className="grid gap-4">
                    {questions.map((question: Question) => {
                        const [firstReply] = question.replies
                        const replyCount = question.replies.length - 1
                        const slackTimestamp = question.question.slack_timestamp

                        return (
                            <li className="flex space-x-9">
                                <div className="flex-grow max-w-[700px]">
                                    <Surface>
                                        <div className="flex items-center justify-between">
                                            <ul className="flex items-center space-x-2">
                                                {question.question.slug?.map((slug) => {
                                                    const url = new URL(domain).origin + slug.trim()
                                                    return (
                                                        <li>
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                className="text-[14px] opacity-50 text-inherit"
                                                            >
                                                                {url}
                                                            </a>
                                                        </li>
                                                    )
                                                })}
                                            </ul>

                                            {question.question.published && (
                                                <span className="flex-shrink-0" title="Published">
                                                    <CheckCircleIcon className="w-6 text-green-500" />
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-red font-bold my-2">{question.question.subject}</h3>
                                        <div>
                                            <ReactMarkdown>{firstReply?.body || ''}</ReactMarkdown>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <Button
                                                href={`/question/${question.question.id}`}
                                                className="mt-3 bg-gray-light text-red bg-opacity-20 font-bold"
                                            >{`${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}</Button>
                                            {slackTimestamp && <p className="text-[13px] opacity-30">via Slack</p>}
                                        </div>
                                    </Surface>
                                </div>
                                <div className="flex space-x-3 max-w-[200px] w-full flex-shrink-0">
                                    <Avatar image={firstReply?.profile?.avatar} />
                                    <div className="opacity-50">
                                        <p className="font-bold">{`${
                                            slackTimestamp
                                                ? 'Slack User'
                                                : `${firstReply.profile?.first_name} ${firstReply.profile?.last_name}`
                                        }`}</p>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
            <nav className="py-3 flex items-center justify-between px-6 max-w-[700px]" aria-label="Pagination">
                <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{start + 1}</span> to{' '}
                        <span className="font-medium">{start + (results.count < 20 ? results.count : 20)}</span> of{' '}
                        <span className="font-medium">{results.count}</span> results
                    </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end space-x-4">
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
        <AdminLayout
            hideTitle
            title={'Questions'}
            navStyle={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(250px, 1fr) 700px 1fr' }}
        >
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(context) {
        const organizationId = await getActiveOrganization(context)
        const start = context.query?.start ? parseInt(context.query?.start as string) : 0
        const {
            data: { company_domain },
        } = await supabaseServerClient(context)
            .from('squeak_config')
            .select('company_domain')
            .eq('organization_id', organizationId)
            .single()
        const { data, error } = await getQuestions(context, { start, organizationId })

        if (error) {
            return { props: { error: error.message } }
        }

        return {
            props: {
                results: data,
                start,
                domain: company_domain,
            },
        }
    },
})

export default Questions
