import { CogIcon } from '@heroicons/react/outline'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import tinytime from 'tinytime'
import { definitions } from '../@types/supabase'
import Button from '../components/Button'
import SlackForm from '../components/SlackForm'
import SlackManifestSnippet from '../components/SlackManifestSnippet'
import Surface from '../components/Surface'
import AdminLayout from '../layout/AdminLayout'
import useActiveOrganization from '../util/useActiveOrganization'
import withAdminAccess from '../util/withAdminAccess'
import { Message as MessageResponse } from './api/slack/messages'

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

interface SlackData {
    slackApiKey: string
    slackQuestionChannel: string
}

const Import = () => {
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const checkbox = useRef<HTMLInputElement>(null)

    const [questions, setQuestions] = useState<Array<MessageResponse>>([])
    const [selectedQuestions, setSelectedQuestions] = useState<Array<MessageResponse>>([])

    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [slackSetup, setSlackSetup] = useState(false)
    const { isLoading } = useUser()
    const [slackData, setSlackData] = useState<SlackData>({
        slackApiKey: '',
        slackQuestionChannel: '',
    })

    useLayoutEffect(() => {
        const isIndeterminate = selectedQuestions.length > 0 && selectedQuestions.length < questions.length
        setChecked(selectedQuestions.length === questions.length)
        setIndeterminate(isIndeterminate)

        if (checkbox.current) {
            checkbox.current.indeterminate = isIndeterminate
        }
    }, [questions.length, selectedQuestions])

    function toggleAll() {
        setSelectedQuestions(checked || indeterminate ? [] : questions)
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    const template = tinytime('{Mo}/{DD}/{YYYY}', { padMonth: true })

    const insertReply = async ({ body, id, created_at }: { body: string; id: number; created_at: Date | null }) => {
        return supabaseClient
            .from<Reply>('squeak_replies')
            .insert({
                created_at: created_at ? created_at.toISOString() : '',
                body,
                message_id: id,
                organization_id: organizationId,
            })
            .limit(1)
            .single()
    }

    const importSelected = async () => {
        setLoading(true)
        const newMessages = [...questions]

        for (const question of selectedQuestions) {
            const index = newMessages.indexOf(question)
            newMessages.splice(index, 1)
            const { subject, slug, body, replies, reply_count, ts } = question
            const { data: message } = await supabaseClient
                .from<Message>('squeak_messages')
                .insert({
                    slack_timestamp: ts,
                    created_at: ts ? new Date(parseInt(ts) * 1000).toISOString() : '',
                    subject: subject || 'No subject',
                    slug: [slug],
                    published: !!subject && !!slug,
                    organization_id: organizationId,
                })
                .single()

            if (!message) {
                continue
            }

            if (reply_count && reply_count >= 1 && replies) {
                await Promise.all(
                    replies.map(({ body, ts }) => {
                        return insertReply({
                            body: body || '',
                            id: message.id,
                            created_at: ts ? new Date(parseInt(ts) * 1000) : null,
                        })
                    })
                )
            } else {
                await insertReply({
                    body: body ?? '',
                    id: message.id,
                    created_at: ts ? new Date(parseInt(ts) * 1000) : null,
                })
            }
        }

        setSelectedQuestions([])
        setQuestions(newMessages)
        setLoading(false)
    }

    const updateSlug = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const newMessages = [...questions]
        const message = newMessages[index]
        message.slug = e.target.value
        setQuestions(newMessages)
    }

    const updateSubject = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const newMessages = [...questions]
        const message = newMessages[index]
        message.subject = e.target.value
        setQuestions(newMessages)
    }

    const getQuestions = useCallback(async () => {
        if (!isLoading) {
            const { data } = await supabaseClient
                .from<Config>('squeak_config')
                .select(`slack_api_key, slack_question_channel`)
                .eq('organization_id', organizationId)
                .single()

            if (!data || !data?.slack_api_key || !data?.slack_question_channel) {
                setSlackData({
                    slackApiKey: data?.slack_api_key || '',
                    slackQuestionChannel: data?.slack_question_channel || '',
                })
                return setSlackSetup(true)
            }

            const { slack_api_key, slack_question_channel } = data
            setSlackData({ slackApiKey: slack_api_key, slackQuestionChannel: slack_question_channel })

            const messages = await fetch('/api/slack/messages', {
                method: 'POST',
                body: JSON.stringify({
                    token: slack_api_key,
                    organizationId,
                    channel: slack_question_channel,
                }),
            }).then((res) => res.json())

            setQuestions(messages)
        }
    }, [isLoading, organizationId])

    const handleSlackSubmit = (values: SlackData) => {
        setSlackData({ slackApiKey: values?.slackApiKey, slackQuestionChannel: values?.slackQuestionChannel })
        setSlackSetup(false)
    }

    useEffect(() => {
        getQuestions()
    }, [getQuestions, isLoading])

    return (
        <>
            <div className="flex items-center space-x-4 mt-8 mb-4">
                <div className="flex items-center space-x-2">
                    <button className="text-lg font-bold text-gray-500 border-b-2 border-gray-500">Slack</button>
                    <button onClick={() => setSlackSetup(!slackSetup)}>
                        <CogIcon
                            className={`w-5 transition-colors ${slackSetup ? 'text-gray-500' : 'text-gray-400'}`}
                        />
                    </button>
                </div>
            </div>
            {slackSetup ? (
                <Surface className="max-w-[500px]">
                    <SlackManifestSnippet />
                    <SlackForm
                        onSubmit={handleSlackSubmit}
                        slackApiKey={slackData.slackApiKey}
                        slackQuestionChannel={slackData.slackQuestionChannel}
                        redirect="/import"
                        actionButtons={(isValid) => (
                            <>
                                <Button disabled={!isValid} type="submit">
                                    Save
                                </Button>
                            </>
                        )}
                    />
                </Surface>
            ) : (
                <div className="flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                {selectedQuestions.length > 0 && (
                                    <div className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                                        <button
                                            disabled={loading}
                                            onClick={importSelected}
                                            type="button"
                                            className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            Import selected
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
                                                Body
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                                Subject
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                                Slug
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {questions.map((message, index) => {
                                            const { ts, body, reply_count, slug, subject } = message
                                            return (
                                                <tr
                                                    key={ts}
                                                    className={
                                                        selectedQuestions.includes(message) ? 'bg-gray-50' : undefined
                                                    }
                                                >
                                                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                        {selectedQuestions.includes(message) && (
                                                            <div className="absolute inset-y-0 left-0 w-0.5 bg-orange-600" />
                                                        )}
                                                        <input
                                                            type="checkbox"
                                                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 sm:left-6"
                                                            value={ts}
                                                            checked={selectedQuestions.includes(message)}
                                                            onChange={(e) =>
                                                                setSelectedQuestions(
                                                                    e.target.checked
                                                                        ? [...selectedQuestions, message]
                                                                        : selectedQuestions.filter((q) => q !== message)
                                                                )
                                                            }
                                                        />
                                                    </td>

                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {ts ? template.render(new Date(parseInt(ts) * 1000)) : 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {reply_count}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                                                        <div className="overflow-hidden text-ellipsis max-w-[450px]">
                                                            <ReactMarkdown>{body || ''}</ReactMarkdown>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                                                        <input
                                                            onChange={(e) => updateSubject(e, index)}
                                                            value={subject}
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                                                        <input onChange={(e) => updateSlug(e, index)} value={slug} />
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

Import.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title={'Import'}>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps() {
        return {
            props: {},
        }
    },
})

export default Import
