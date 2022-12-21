import { TopicGroup } from '@prisma/client'
import type { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import AdminLayout from '../layout/AdminLayout'
import { withAdminGetStaticProps } from '../util/withAdminAccess'
import Modal from '../components/Modal'
import { useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import Input from '../components/Input'
import { createTopicGroup, getTopicGroups, getTopics, patchTopic, patchTopicGroup } from '../lib/api/topics'
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

    const handleUpdateTopic = async ({
        topicGroup,
        newTopicGroup,
        label,
        editTopicGroup,
    }: {
        topicGroup: string | bigint
        newTopicGroup: string
        label: string
        editTopicGroup: string | null
    }) => {
        setLoading(true)
        let topicGroupId: bigint | string = topicGroup
        if (newTopicGroup) {
            const topicGroupRes = await createTopicGroup(newTopicGroup.trim())
            if (topicGroupRes?.body?.id) topicGroupId = topicGroupRes?.body?.id
        } else if (editTopicGroup) {
            await patchTopicGroup({ organizationId, id: topicGroupId, label: editTopicGroup })
        }
        await patchTopic({ organizationId, id, label, topicGroupId: topicGroupId as string })
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
                    initialValues={{
                        topicGroup: topicGroups[0]?.id,
                        newTopicGroup: '',
                        label,
                        editTopicGroup: topicGroups[0]?.label,
                    }}
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
                    onSubmit={({ newTopicGroup, topicGroup, label, editTopicGroup }) =>
                        handleUpdateTopic({ newTopicGroup, topicGroup, label, editTopicGroup })
                    }
                >
                    {({ values, setFieldValue }) => {
                        return (
                            <Form>
                                <Input value={values.label} label="Label" placeholder="Label" id="label" name="label" />
                                <TopicGroupForm
                                    handleRemoveTopicGroup={handleRemoveTopicGroup}
                                    topicGroups={topicGroups}
                                    loading={loading}
                                    topicGroup={topic_group}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                />
                                <div className="flex items-center mt-4 space-x-6">
                                    <Button type="submit" loading={loading} disabled={loading}>
                                        Update
                                    </Button>
                                </div>
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
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <button onClick={() => setModalOpen(true)} className="text-red font-semibold">
                        Edit
                    </button>
                </td>
            </tr>
        </>
    )
}

const TopicGroupForm = ({ loading, topicGroups, handleRemoveTopicGroup, topicGroup, values, setFieldValue }) => {
    const [createNewGroup, setCreateNewGroup] = useState(false)
    const [editGroup, setEditGroup] = useState(false)

    useEffect(() => {
        setFieldValue('editTopicGroup', topicGroups.find((group) => group?.id === values.topicGroup)?.label)
    }, [values?.topicGroup])

    return (
        <>
            {editGroup ? (
                <Input
                    value={values.editTopicGroup}
                    label="Edit group"
                    placeholder="Edit group"
                    id="edit-topic-group"
                    name="editTopicGroup"
                />
            ) : createNewGroup ? (
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
            <div className="w-full flex justify-between">
                {createNewGroup ? (
                    <button
                        type="button"
                        className="text-red font-semibold -mt-4 block"
                        onClick={(e) => {
                            e.preventDefault()
                            setCreateNewGroup(false)
                            setEditGroup(false)
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
                            setEditGroup(false)
                        }}
                    >
                        Create new group
                    </button>
                )}
                {!createNewGroup && (
                    <button
                        type="button"
                        className="text-red font-semibold -mt-4 block"
                        onClick={(e) => {
                            e.preventDefault()
                            setFieldValue(
                                'editTopicGroup',
                                editGroup ? null : topicGroups.find((group) => group?.id === values.topicGroup)?.label
                            )
                            setEditGroup(!editGroup)
                        }}
                    >
                        Edit group
                    </button>
                )}
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
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                        >
                                            <span className="sr-only">Edit</span>
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
    return (
        <AdminLayout title={'Topics'}>
            <TopicsLayout organizationId={organizationId} />
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: () => '/login',
    async getServerSideProps(_, user) {
        return {
            props: { organizationId: user.organizationId },
        }
    },
})

export default Topics
