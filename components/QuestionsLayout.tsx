import { CheckCircleIcon } from '@heroicons/react/outline'
import groupBy from 'lodash.groupby'
import ReactMarkdown from 'react-markdown'
import type { definitions } from '../@types/supabase'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Surface from '../components/Surface'
import dateToDays from '../util/dateToDays'
import dayFormat from '../util/dayFormat'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']
type Profile = definitions['squeak_profiles']
type ReplyWithProfile = Pick<Reply, 'body'> & { profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar'> }

interface Question {
    question: Message
    replies: Array<ReplyWithProfile>
}

interface Props {
    results: {
        questions: Array<Question>
        count: number
    }
    start: number
    domain: string | null
    title: string
    noQuestionsMessage: React.ReactNode
}

export const QuestionsLayout: React.VoidFunctionComponent<Props> = ({
    results,
    domain,
    start,
    title,
    noQuestionsMessage,
}) => {
    const { questions } = results

    const grouped = groupBy(questions, (question: Question) => {
        const { created_at } = question.question
        return dateToDays(created_at)
    })
    return (
        <div>
            <h1 className="mb-2">
                {title} <span className="text-[14px] opacity-50 font-semibold">by date</span>
            </h1>
            {questions.length <= 0 ? (
                <Surface className="max-w-[700px]">{noQuestionsMessage}</Surface>
            ) : (
                <ul className="grid gap-2">
                    {Object.keys(grouped).map((days) => {
                        return (
                            <li key={days}>
                                <h4 className="text-[14px] opacity-30 m-0 font-bold">{dayFormat(Number(days))}</h4>
                                <ul className="grid gap-4">
                                    {grouped[days].map((question: Question) => {
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
                                                            <h3 className="text-red font-bold my-0 pr-12">
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
                                                                className="mt-3 bg-gray-light text-red bg-opacity-10 font-bold hover:bg-opacity-20 active:bg-opacity-25"
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
                                                        <Avatar image={firstReply?.profile?.avatar} />
                                                        <div className="opacity-50 text-xs">
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
            <nav className="py-3 flex items-center justify-between" aria-label="Pagination">
                <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                        {/* Showing <span className="font-medium">{start + 1}</span> to{' '}
                        <span className="font-medium">{start + (results.count < 20 ? results.count : 20)}</span> of{' '} */}
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
