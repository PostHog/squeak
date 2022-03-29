import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import tinytime from 'tinytime'

export default function ImportSlack() {
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState([])
    const checkbox = useRef(null)
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState([])

    useLayoutEffect(() => {
        const isIndeterminate = selectedQuestions.length > 0 && selectedQuestions.length < messages.length
        setChecked(selectedQuestions.length === messages.length)
        setIndeterminate(isIndeterminate)

        if (checkbox.current) {
            checkbox.current.indeterminate = isIndeterminate
        }
    }, [messages.length, selectedQuestions])

    function toggleAll() {
        setSelectedQuestions(checked || indeterminate ? [] : messages)
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    const template = tinytime('{Mo}/{DD}/{YYYY}', { padMonth: true })

    const importSelected = async () => {
        if (selectedQuestions?.every((message) => message.slug && message.subject)) {
        }
    }

    const getSlackMessages = async () => {
        const {
            data: { slack_api_key, slack_question_channel },
        } = await supabaseClient
            .from('squeak_config')
            .select(`slack_api_key, slack_question_channel`)
            .eq('id', 1)
            .single()
        const messages = await fetch(`/api/slack/messages`, {
            method: 'POST',
            body: JSON.stringify({
                token: slack_api_key,
                channel: slack_question_channel,
            }),
        }).then((res) => res.json())

        setMessages(messages)
        setLoading(false)
    }

    const updateSlug = (e, index) => {
        const newMessages = [...messages]
        const message = newMessages[index]
        message.slug = e.target.value
        setMessages(newMessages)
    }

    const updateSubject = (e, index) => {
        const newMessages = [...messages]
        const message = newMessages[index]
        message.subject = e.target.value
        setMessages(newMessages)
    }

    useEffect(() => {
        getSlackMessages()
    }, [])
    return (
        <div>
            {loading && !messages ? (
                <p>Getting recent Slack messages...</p>
            ) : (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                {selectedQuestions.length > 0 && (
                                    <div className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                                        <button
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
                                        {messages.map((message, index) => {
                                            const { ts, body, reply_count, client_msg_id, slug, subject } = message
                                            return (
                                                <tr
                                                    key={client_msg_id}
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
                                                            value={client_msg_id}
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
                                                        {ts ? template.render(new Date(ts * 1000)) : 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {reply_count}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                                                        <div className="overflow-hidden text-ellipsis max-w-[450px]">
                                                            <ReactMarkdown>{body}</ReactMarkdown>
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
        </div>
    )
}
