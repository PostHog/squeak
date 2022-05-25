import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import Button from './Button'
import Input from './Input'
import Modal from './Modal'

export interface TopicsProps {
    questionId: String
    organizationId: String
}

interface ChipProps {
    handleSelect: (selected: Boolean, label: String) => void
    handleDelete: (id: Number, label: String) => void
    selected?: boolean
    label: String
    className?: String
    id: Number
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
            <button className="pl-4 py-1" title={`Click to ${selected ? 'remove' : 'add'} topic`} onClick={handleClick}>
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
    const [selectedTopics, setSelectedTopics] = useState<String[]>([])
    const [allTopics, setAllTopics] = useState<{ label: String; id: Number }[] | [] | null>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [creatingTopic, setCreatingTopic] = useState(false)
    const handleSelect = async (selected: Boolean, label: String) => {
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
        return await supabaseClient
            .from('squeak_messages')
            .update({ topics: newSelectedTopics })
            .match({ id: questionId })
    }

    const getAllTopics = async () => {
        const { data } = await supabaseClient
            .from<{ label: String; id: Number }>('squeak_topics')
            .select('label, id')
            .match({ organization_id: organizationId })
        return data
    }

    const getSelectedTopics = async () => {
        const {
            data: { topics },
        } = await supabaseClient.from('squeak_messages').select('topics').eq('id', questionId).single()
        return topics
    }

    const handleNewTopic = async ({ topic }: { topic: String }) => {
        setCreatingTopic(true)
        await supabaseClient.from('squeak_topics').insert({ label: topic, organization_id: organizationId })
        getAllTopics().then((allTopics) => {
            setAllTopics(allTopics)
            setCreatingTopic(false)
            setModalOpen(false)
        })
    }

    const handleDelete = async (id: Number, label: String) => {
        await supabaseClient.from('squeak_topics').delete().match({ id, organization_id: organizationId })
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
                    {({ isValid }) => {
                        return (
                            <Form>
                                <Input label="New topic" id="topic" name="topic" placeholder="New topic" />

                                <div className="flex space-x-6 items-center mt-4">
                                    <Button loading={creatingTopic} disabled={creatingTopic}>
                                        Add topic
                                    </Button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </Modal>
            <ul className="flex space-x-2 items-center flex-wrap">
                {allTopics &&
                    allTopics.map(({ label, id }, index) => {
                        return (
                            <Chip
                                id={id}
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
