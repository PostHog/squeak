import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import tinytime from 'tinytime'
import { definitions } from '../@types/supabase'
import Button from '../components/Button'
import SlackForm from '../components/SlackForm'
import SlackManifestSnippet from '../components/SlackManifestSnippet'
import SlackTableSkeleton from '../components/SlackTableSkeleton'
import Surface from '../components/Surface'
import useActiveOrganization from '../hooks/useActiveOrganization'
import AdminLayout from '../layout/AdminLayout'
import withAdminAccess from '../util/withAdminAccess'
import { Message as MessageResponse } from './api/slack/messages'

type Config = definitions['squeak_config']
type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

interface SlackData {
    slackApiKey: string
    slackQuestionChannel: string
}

const Slack = () => {
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
    const [loadingQuestions, setLoadingQuestions] = useState(false)

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

    const insertReply = async ({
        body,
        id,
        created_at,
        user,
    }: {
        body: string
        id: number
        created_at: Date | null
        user?: {
            first_name: string
            last_name: string
            avatar: string
            user_id: string
        }
    }) => {
        const { profileId } = await fetch('/api/user/create', {
            method: 'POST',
            body: JSON.stringify({
                first_name: user?.first_name,
                last_name: user?.last_name,
                avatar: user?.avatar,
                organization_id: organizationId,
                slack_user_id: user?.user_id,
            }),
        }).then((res) => res.json())

        return supabaseClient
            .from<Reply>('squeak_replies')
            .insert({
                created_at: created_at ? created_at.toISOString() : '',
                body,
                message_id: id,
                organization_id: organizationId,
                profile_id: profileId,
                published: true,
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
            const { subject, slug, body, replies, reply_count, ts, user } = question
            const { data: message } = await supabaseClient
                .from<Message>('squeak_messages')
                .insert({
                    slack_timestamp: ts,
                    created_at: ts ? new Date(parseInt(ts) * 1000).toISOString() : '',
                    subject: subject || 'No subject',
                    slug: slug.split(','),
                    published: !!subject && !!slug,
                    organization_id: organizationId,
                })
                .single()

            if (!message) {
                continue
            }

            if (reply_count && reply_count >= 1 && replies) {
                await Promise.all(
                    replies.map(({ body, ts, user }) => {
                        return insertReply({
                            body: body || '',
                            id: message.id,
                            created_at: ts ? new Date(parseInt(ts) * 1000) : null,
                            user,
                        })
                    })
                )
            } else {
                await insertReply({
                    body: body ?? '',
                    id: message.id,
                    created_at: ts ? new Date(parseInt(ts) * 1000) : null,
                    user,
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
            setLoadingQuestions(true)
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
            }).then((res) => (res.ok ? res.json() : []))
            setLoadingQuestions(false)
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
            {slackSetup ? (
                <>
                    <h3 className="pb-0 text-lg font-bold">
                        Import recent Slack threads and display them on specific pages of your site.
                    </h3>
                    <p className="pt-0 pb-4 mt-0">
                        This allows you to answer a question from your Slack community <em>once</em> and let others see
                        your answer where users are most likely to ask it.
                    </p>
                    <Surface className="max-w-prose">
                        <SlackManifestSnippet />
                        <SlackForm
                            onSubmit={handleSlackSubmit}
                            slackApiKey={slackData.slackApiKey}
                            slackQuestionChannel={slackData.slackQuestionChannel}
                            redirect="/slack"
                            actionButtons={(isValid, loading) => (
                                <>
                                    <Button loading={loading} disabled={!isValid} type="submit">
                                        Save
                                    </Button>
                                </>
                            )}
                        />
                    </Surface>
                </>
            ) : (
                <div className="flex flex-col">
                    <p className="pt-0 pb-4">
                        Select from the most recent 50 threads in a specified Slack channel to import and display on
                        your site. Just set a title and the relative URL(s) where the question should appear.
                    </p>
                    <div className="relative max-w-[600px]">
                        <div className="flex items-center pb-4">
                            <input
                                type="checkbox"
                                id="toggle-all"
                                className="w-4 h-4 mr-2 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                ref={checkbox}
                                checked={checked}
                                onChange={toggleAll}
                            />

                            <label htmlFor="toggle-all" className="mr-4 text-sm cursor-pointer">
                                Toggle all
                            </label>

                            {selectedQuestions.length > 0 && (
                                <div className="">
                                    <button
                                        disabled={loading}
                                        onClick={importSelected}
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm text-white rounded bg-red focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        Import selected
                                    </button>
                                </div>
                            )}
                        </div>

                        {loadingQuestions ? (
                            <SlackTableSkeleton />
                        ) : (
                            questions.map((message, index) => {
                                const { ts, body, reply_count, slug, subject } = message
                                return (
                                    <div
                                        key={ts}
                                        className={
                                            selectedQuestions.includes(message)
                                                ? 'relative rounded-lg pl-12 pr-8 py-4 -ml-4 mb-2 bg-gray-50'
                                                : 'relative rounded-lg pl-12 pr-8 py-4 -ml-4 mb-2'
                                        }
                                    >
                                        {selectedQuestions.includes(message) && (
                                            <div className="absolute inset-y-0 left-0 w-1 bg-orange-600" />
                                        )}

                                        <input
                                            type="checkbox"
                                            className="absolute w-4 h-4 text-orange-600 border-gray-300 rounded left-4 top-6 focus:ring-orange-500"
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

                                        <div className="squeak">
                                            <div className="squeak-question-container">
                                                <div className="squeak-post">
                                                    <div className="squeak-post-author">
                                                        <div className="squeak-avatar-container">
                                                            <svg
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 40 40"
                                                            >
                                                                <path d="M0 0h40v40H0z"></path>
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M21.19 6.57c-5.384-.696-9.938 3.89-9.93 10.343.013.1.026.229.042.378.045.443.11 1.067.262 1.67.883 3.445 2.781 6.077 6.305 7.132 3.117.938 5.86.04 8.14-2.242 3.008-3.016 3.805-8.039 1.891-12.047-1.36-2.844-3.484-4.82-6.71-5.234ZM2.5 40c-.64-1.852 1.119-6.454 2.947-7.61 2.48-1.563 5.076-2.942 7.671-4.32.48-.255.96-.51 1.438-.766.313-.164.899.008 1.29.188 2.827 1.242 5.624 1.25 8.468.03.492-.21 1.242-.241 1.695-.015 2.688 1.367 5.352 2.774 7.961 4.281 2.352 1.36 4.35 6.056 3.53 8.212h-35Z"
                                                                    fill="#fff"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        <strong className="squeak-author-name">Anonymous</strong>
                                                        <span className="squeak-post-timestamp">
                                                            {ts
                                                                ? template.render(new Date(parseInt(ts) * 1000))
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="pb-2 squeak-post-content">
                                                        <input
                                                            onChange={(e) => updateSubject(e, index)}
                                                            value={subject}
                                                            placeholder="Add a subject..."
                                                            className="!rounded-bl-none !rounded-br-none"
                                                        />
                                                        <div className="mb-2 squeak-post-markdown">
                                                            <div className="overflow-hidden text-ellipsis bg-gray-light bg-opacity-20 cursor-not-allowed px-3 py-4 max-w-full border border-solid border-[#BFBFBC] border-t-0 rounded-bl rounded-br">
                                                                <ReactMarkdown>{body || ''}</ReactMarkdown>
                                                            </div>
                                                        </div>

                                                        <input
                                                            onChange={(e) => updateSlug(e, index)}
                                                            value={slug}
                                                            placeholder="URL"
                                                        />
                                                        <p className="text-sm text-gray-500">
                                                            Ex: /relative/path-to/page
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="squeak-reply-form-container">
                                                    <div className="squeak-reply-buttons">
                                                        <div className="squeak-avatar-container">
                                                            <svg
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 40 40"
                                                            >
                                                                <path d="M0 0h40v40H0z"></path>
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M21.19 6.57c-5.384-.696-9.938 3.89-9.93 10.343.013.1.026.229.042.378.045.443.11 1.067.262 1.67.883 3.445 2.781 6.077 6.305 7.132 3.117.938 5.86.04 8.14-2.242 3.008-3.016 3.805-8.039 1.891-12.047-1.36-2.844-3.484-4.82-6.71-5.234ZM2.5 40c-.64-1.852 1.119-6.454 2.947-7.61 2.48-1.563 5.076-2.942 7.671-4.32.48-.255.96-.51 1.438-.766.313-.164.899.008 1.29.188 2.827 1.242 5.624 1.25 8.468.03.492-.21 1.242-.241 1.695-.015 2.688 1.367 5.352 2.774 7.961 4.281 2.352 1.36 4.35 6.056 3.53 8.212h-35Z"
                                                                    fill="#fff"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        {reply_count} replies
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

Slack.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout
            contentStyle={{ maxWidth: 1200, margin: '0 auto', paddingLeft: '1rem' }}
            title={'Import Slack threads'}
        >
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps() {
        return {
            props: {},
        }
    },
})

export default Slack
