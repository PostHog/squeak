import ReactMarkdown from 'react-markdown'
import type { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
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
}

const QuestionsLayout: React.VoidFunctionComponent<Props> = ({ results }) => {
    const { questions } = results
    return (
        <div>
            <ul className="grid gap-4">
                {questions.map((question: Question) => {
                    const [firstReply] = question.replies
                    const replyCount = question.replies.length - 1
                    const slackTimestamp = question.question.slack_timestamp
                    return (
                        <li className="flex space-x-9">
                            <div className="p-7 bg-white shadow-md rounded-md flex-grow max-w-[700px]">
                                <p className="text-[14px] opacity-50">{question.question.slug}</p>
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
        </div>
    )
}

const Questions: NextPageWithLayout<Props> = ({ results, start }) => {
    return <QuestionsLayout results={results} start={start} />
}

Questions.getLayout = function getLayout(page) {
    return (
        <AdminLayout
            style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(250px, 1fr) 700px 1fr' }}
            title={'Questions'}
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

        const { data, error } = await getQuestions(context, { start, organizationId })

        if (error) {
            return { props: { error: error.message } }
        }

        return {
            props: {
                results: data,
                start,
            },
        }
    },
})

export default Questions
