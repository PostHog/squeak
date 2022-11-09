import { Topic } from '@prisma/client'
import React from 'react'
import Link from 'next/link'
import { Combobox, Popover } from '@headlessui/react'
import { classNames } from 'src/lib/utils'

export interface QuestionTopicsProps {
    questionId: string
    allTopics: Topic[]
    topics: Topic[]
}

const QuestionTopics: React.FC<QuestionTopicsProps> = ({ questionId, allTopics, topics = [] }) => {
    const [query, setQuery] = React.useState<string>('')
    const [selected, setSelected] = React.useState<Topic[]>(topics)

    const filteredTopics =
        query === ''
            ? allTopics
            : allTopics.filter((topic) => {
                  return topic.label.toLowerCase().includes(query.toLowerCase())
              })

    const handleClick = async (id: bigint, isSelected: boolean) => {
        try {
            if (isSelected) {
                await fetch(`/api/question/${questionId}/topics`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topics: [id.toString()],
                    }),
                })
            } else {
                await fetch(`/api/question/${questionId}/topics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topics: [id.toString()],
                    }),
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const createTopic = async (label: string) => {
        try {
            const res = await fetch(`/api/topics/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    label,
                }),
            })

            const newTopic: Topic = await res.json()

            await fetch(`/api/question/${questionId}/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topics: [newTopic.id.toString()],
                }),
            })

            setSelected((selected) => [...selected, newTopic])
            allTopics = [...allTopics, newTopic]

            setQuery('')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <Popover className="relative mt-8 mb-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Topics</h3>

                    <Popover.Button className="text-red hover:opacity-80" onClick={() => setQuery('')}>
                        Edit topics
                    </Popover.Button>
                </div>

                <Popover.Panel className="absolute inset-x-0 top-full bg-white z-50 rounded-md mt-1 shadow border border-gray-200">
                    <Combobox
                        value={selected}
                        onChange={(value) => setSelected(value)}
                        multiple
                        by={(a, b) => a.id.toString() === b.id.toString()}
                    >
                        <div className="border-b border-gray-2 px-3 pt-3 pb-2">
                            <span className="font-bold block py-1">Apply labels to this question</span>

                            <div className="py-1">
                                <Combobox.Input
                                    className="bg-gray-100 border border-gray-200 text-gray-800 rounded"
                                    placeholder="Filter topics"
                                    onChange={(event) => setQuery(event.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Combobox.Options className="max-h-60 overflow-y-scroll px-3 pt-2 pb-3" static>
                            {filteredTopics.map((topic) => (
                                <Combobox.Option key={topic.id.toString()} value={topic}>
                                    {({ selected, active }) => (
                                        <button
                                            onClick={() => handleClick(topic.id, selected)}
                                            className={classNames(
                                                active ? 'bg-red text-white' : null,
                                                'w-full flex items-center justify-between text-left px-2 py-1.5 hover:bg-red hover:text-white rounded'
                                            )}
                                        >
                                            <span>{topic.label}</span>

                                            {selected && (
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
                                                    className={classNames(
                                                        active ? 'text-white' : 'text-red',
                                                        'w-5 h-5  hover:text-white'
                                                    )}
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </Combobox.Option>
                            ))}

                            {query !== '' &&
                            (filteredTopics.length === 0 ||
                                (filteredTopics.length === 1 && filteredTopics[0].label !== query)) ? (
                                <button
                                    onClick={() => createTopic(query)}
                                    className="w-full px-2 py-1.5 hover:bg-red hover:text-white rounded text-left focus:bg-red focus:text-white"
                                >
                                    Create new topic &quot;{query}&quot;
                                </button>
                            ) : null}
                        </Combobox.Options>
                    </Combobox>
                </Popover.Panel>
            </Popover>

            {selected.length > 0 ? (
                <ul>
                    {selected.map((topic) => {
                        return (
                            <li key={topic.id.toString()}>
                                <Link href={'/topics' /*`/topics/${topic.id}`*/}>
                                    <a>{topic.label}</a>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="text-gray-500">None yet</p>
            )}
        </div>
    )
}

export default QuestionTopics
