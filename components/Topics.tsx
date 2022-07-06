import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'

import { getQuestionTopics, updateQuestionTopics } from '../lib/api'
import { createTopic, deleteTopic, getTopics } from '../lib/api/topics'
import { GetTopicsResponse } from '../pages/api/topics'
import Button from './Button'
import Input from './Input'
import Modal from './Modal'

export interface TopicsProps {
    questionId: string
    organizationId: string
}

interface ChipProps {
    handleSelect: (selected: boolean, label: string) => void
    handleDelete: (id: number, label: string) => void
    selected?: boolean
    label: string
    className?: string
    id: number
}

const Chip: React.FC<ChipProps> = ({ handleSelect, handleDelete, selected, label, id, className = '' }) => {
    const handleClick = () => {
        handleSelect(!selected, label)
    }
    return (
        <li
            className={`${
                selected ? 'bg-accent-light border-accent-light' : 'border-gray-500 text-black'
            } rounded-full  inline-flex space-x-2 items-center shadow-sm transition-colors border text-white text-sm ${className}`}
        >
            <button className="py-1 pl-4" title={`Click to ${selected ? 'remove' : 'add'} topic`} onClick={handleClick}>
                <span>{label}</span>
            </button>
            <button
                className={`pr-4 py-1 text-xl font-bold opacity-70 hover:opacity-100 transition-opacity ${
                    selected ? 'text-white' : 'text-black'
                }`}
                onClick={() => handleDelete(id, label)}
            >
                &times;
            </button>
        </li>
    )
}

export default function Topics({ questionId, organizationId }: TopicsProps) {
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    const [allTopics, setAllTopics] = useState<{ label: string; id: number | bigint }[] | []>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [creatingTopic, setCreatingTopic] = useState(false)

    const handleSelect = async (selected: boolean, label: string) => {
        const newSelectedTopics = [...selectedTopics]
        if (!selected) {
            const labelIndex = selectedTopics.indexOf(label)
            if (labelIndex >= 0) {
                newSelectedTopics.splice(labelIndex, 1)
            }
        } else {
            newSelectedTopics.push(label)
        }
        setSelectedTopics(newSelectedTopics)
        return await updateQuestionTopics(questionId, newSelectedTopics)
    }

    const getAllTopics = async () => {
        const { body } = await getTopics()
        return body
    }

    const getSelectedTopics = async () => {
        const { body } = await getQuestionTopics(questionId)
        return body
    }

    const handleNewTopic = async ({ topic }: { topic: string }) => {
        setCreatingTopic(true)

        await createTopic(topic)
        getAllTopics().then((allTopics) => {
            setAllTopics(allTopics)
            setCreatingTopic(false)
            setModalOpen(false)
        })
    }

    const handleDelete = async (id: number) => {
        await deleteTopic(id)
        getAllTopics().then((allTopics) => setAllTopics(allTopics))
    }

    useEffect(() => {
        getSelectedTopics().then((topics) => setSelectedTopics(topics || []))
        getAllTopics().then((allTopics) => setAllTopics(allTopics))
    }, [])

    return (
        <>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Formik
                    initialValues={{ topic: '' }}
                    validateOnMount
                    validate={(values) => {
                        const errors: {
                            topic?: string
                        } = {}
                        if (!values.topic) {
                            errors.topic = 'Required'
                        }

                        return errors
                    }}
                    onSubmit={handleNewTopic}
                >
                    {() => {
                        return (
                            <Form>
                                <Input label="New topic" id="topic" name="topic" placeholder="New topic" />

                                <div className="flex items-center mt-4 space-x-6">
                                    <Button loading={creatingTopic} disabled={creatingTopic}>
                                        Add topic
                                    </Button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </Modal>
            <ul className="flex flex-wrap items-center space-x-2">
                {allTopics &&
                    allTopics.map(({ label, id }, index) => {
                        return (
                            <Chip
                                id={id as number}
                                label={label}
                                selected={selectedTopics?.includes(label)}
                                key={index}
                                handleSelect={handleSelect}
                                handleDelete={handleDelete}
                            />
                        )
                    })}
                <li>
                    <button onClick={() => setModalOpen(true)} className="font-semibold text-accent-light">
                        Add topic
                    </button>
                </li>
            </ul>
        </>
    )
}
