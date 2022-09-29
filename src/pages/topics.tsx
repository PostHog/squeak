import { TopicGroup } from '@prisma/client'
import type { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import AdminLayout from '../layout/AdminLayout'
import getActiveOrganization from '../util/getActiveOrganization'
import withAdminAccess from '../util/withAdminAccess'
import Modal from '../components/Modal'
import { useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import Input from '../components/Input'
import { createTopicGroup, getTopicGroups, getTopics, patchTopic } from '../lib/api/topics'
import Select from '../components/Select'
import { ID } from '../lib/types'
import { GetTopicsResponse } from './api/topics'

interface Props {
    organizationId: string
}

interface RowProps {
    organizationId: string
    label: string
    id: ID
    handleSubmit: () => void
    topic_group?: TopicGroup
    topicGroups: TopicGroup[]
}

const Row = ({ label, topic_group, id, organizationId, handleSubmit, topicGroups }: RowProps) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleAddTopicToGroup = async ({
        topicGroup,
        newTopicGroup,
    }: {
        topicGroup: string | bigint
        newTopicGroup: string
    }) => {
        setLoading(true)
        let topicGroupId: bigint | string = topicGroup
        if (newTopicGroup) {
            const topicGroupRes = await createTopicGroup(newTopicGroup.trim())
            if (topicGroupRes?.body?.id) topicGroupId = topicGroupRes?.body?.id
        }
        await patchTopic({ organizationId, id, topicGroupId: topicGroupId as string })
        setModalOpen(false)
        handleSubmit()
        setLoading(false)
    }

    const handleRemoveTopicGroup = async () => {
        await patchTopic({ organizationId, id, topicGroupId: null })
        setModalOpen(false)
        handleSubmit()
    }

    return (
        <>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Formik
                    initialValues={{ topicGroup: topicGroups[0]?.id, newTopicGroup: '' }}
                    validateOnMount
                    validate={(values) => {
                        const errors: {
                            topicGroup?: string
                        } = {}
                        if (!values.topicGroup && !values.newTopicGroup) {
                            errors.topicGroup = 'Required'
                        }

                        return errors
                    }}
                    onSubmit={({ newTopicGroup, topicGroup }) => handleAddTopicToGroup({ newTopicGroup, topicGroup })}
                >
                    {() => {
                        return (
                            <Form>
                                <TopicGroupForm
                                    handleRemoveTopicGroup={handleRemoveTopicGroup}
                                    topicGroups={topicGroups}
                                    loading={loading}
                                />
                            </Form>
                        )
                    }}
                </Formik>
            </Modal>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                    <p>{label}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <button onClick={() => setModalOpen(true)} className="text-red font-semibold">
                        {topic_group?.label || 'Add to a group'}
                    </button>
                </td>
            </tr>
        </>
    )
}

const TopicGroupForm = ({ loading, topicGroups, handleRemoveTopicGroup }) => {
    const [createNewGroup, setCreateNewGroup] = useState(false)

    return (
        <>
            {createNewGroup ? (
                <Input label="New group" placeholder="New group" id="new-topic-group" name="newTopicGroup" />
            ) : (
                <Select
                    label="Topic groups"
                    id="topic-group"
                    name="topicGroup"
                    options={topicGroups.map(({ label, id }) => {
                        return { name: label, value: id }
                    })}
                />
            )}
            {createNewGroup ? (
                <button
                    type="button"
                    className="text-red font-semibold -mt-4 block"
                    onClick={(e) => {
                        e.preventDefault()
                        setCreateNewGroup(false)
                    }}
                >
                    Add to existing group
                </button>
            ) : (
                <button
                    type="button"
                    className="text-red font-semibold -mt-4 block"
                    onClick={(e) => {
                        e.preventDefault()
                        setCreateNewGroup(true)
                    }}
                >
                    Create new group
                </button>
            )}

            <div className="flex items-center mt-4 space-x-6">
                <Button type="submit" loading={loading} disabled={loading}>
                    Add
                </Button>
                <Button type="button" onClick={handleRemoveTopicGroup} loading={loading} disabled={loading}>
                    Remove
                </Button>
            </div>
        </>
    )
}

const TopicsLayout: React.VoidFunctionComponent<Props> = ({ organizationId }) => {
    const [topics, setTopics] = useState<GetTopicsResponse[]>([])
    const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([])

    useEffect(() => {
        getTopics(organizationId).then(({ data }) => setTopics(data || []))
        getTopicGroups(organizationId).then(({ data }) => {
            setTopicGroups(data || [])
        })
    }, [])

    return (
        <>
            <div className="flex flex-col mt-8">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden border-b shadow border-gray-light-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                        >
                                            Label
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                        >
                                            Group
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topics.map((topic) => (
                                        <Row
                                            topicGroups={topicGroups}
                                            handleSubmit={() => {
                                                getTopics(organizationId).then(({ data }) => setTopics(data || []))
                                                getTopicGroups(organizationId).then(({ data }) => {
                                                    setTopicGroups(data || [])
                                                })
                                            }}
                                            key={topic.id + ''}
                                            organizationId={organizationId}
                                            {...topic}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const Topics: NextPageWithLayout<Props> = ({ organizationId }) => {
    return <TopicsLayout organizationId={organizationId} />
}

Topics.getLayout = function getLayout(page) {
    return <AdminLayout title={'Topics'}>{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps(context) {
        const organizationId = await getActiveOrganization(context)

        return {
            props: { organizationId },
        }
    },
})

export default Topics
