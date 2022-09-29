import { CheckIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'
import { deleteRoadmap, updateRoadmap } from '../lib/api/roadmap'
import { RoadmapForm } from '../pages/team/[id]'
import Modal from './Modal'
import uniqBy from 'lodash.groupby'

const RoadmapTable = ({ roadmap, onUpdate }) => {
    const categories = Object.keys(uniqBy(roadmap, 'category'))
    return (
        <div className="flex flex-col">
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
                                        Title
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Complete
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Completed on
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Category
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
                                {roadmap.map((roadmapItem) => (
                                    <RoadmapRow
                                        categories={categories}
                                        onUpdate={onUpdate}
                                        key={String(roadmapItem.id)}
                                        roadmapItem={roadmapItem}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RoadmapRow = ({ roadmapItem, onUpdate, categories }) => {
    const {
        title,
        description,
        complete,
        category,
        id,
        github_urls,
        date_completed,
        projected_completion_date,
        milestone,
    } = roadmapItem
    const [modalOpen, setModalOpen] = useState(false)

    const handleSubmit = async (values) => {
        const { data: roadmap } = await updateRoadmap(id, values)
        onUpdate()
        setModalOpen(false)
    }

    const handleDelete = async () => {
        await deleteRoadmap(id)
        onUpdate()
    }

    return (
        <>
            <Modal open={modalOpen} onClose={setModalOpen}>
                <RoadmapForm
                    onSubmit={handleSubmit}
                    submitText="Update goal"
                    categories={categories}
                    initialValues={{
                        complete,
                        github_urls,
                        description,
                        date_completed: date_completed ? new Date(date_completed).toISOString().slice(0, 10) : '',
                        projected_completion_date: projected_completion_date
                            ? new Date(projected_completion_date).toISOString().slice(0, 10)
                            : '',
                        title,
                        category,
                        milestone,
                    }}
                    handleDelete={handleDelete}
                />
            </Modal>
            <tr>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{title}</td>

                <td className="px-6 py-4 text-sm text-[green] whitespace-nowrap">
                    {complete && <CheckIcon className=" w-6" />}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {date_completed ? new Date(date_completed).toISOString().slice(0, 10) : ''}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{category}</td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <button onClick={() => setModalOpen(true)} className="text-red font-bold">
                        Edit
                    </button>
                </td>
            </tr>
        </>
    )
}

export default RoadmapTable
