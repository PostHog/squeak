import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline'
import React, { useEffect, useState } from 'react'
import { deleteRoadmap, updateRoadmap } from '../lib/api/roadmap'
import { RoadmapForm } from '../pages/team/[id]'
import Modal from './Modal'
import { GetRoadmapResponse } from 'src/pages/api/roadmap'
import { Combobox } from '@headlessui/react'
import { getTeams } from 'src/lib/api'
import { GetTeamResponse } from 'src/pages/api/teams'
import { SqueakConfig } from '@prisma/client'

const RoadmapTable = ({
    roadmap,
    onUpdate,
    showTeams = false,
    categories,
    config,
}: {
    roadmap: GetRoadmapResponse[]
    onUpdate?: () => void
    showTeams?: boolean
    categories?: string[]
    config?: SqueakConfig
}) => {
    const [teams, setTeams] = useState<GetTeamResponse[]>()

    useEffect(() => {
        if (showTeams) {
            getTeams().then(({ data }) => {
                data && setTeams(data)
            })
        }
    }, [])

    return (
        <div className="flex flex-col">
            <div className="-my-2 sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b shadow border-gray-light-200 rounded-lg">
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
                                        Subscribers
                                    </th>
                                    {showTeams && (
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                        >
                                            Team
                                        </th>
                                    )}
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
                                        config={config}
                                        categories={categories || []}
                                        onUpdate={onUpdate}
                                        key={String(roadmapItem.id)}
                                        roadmapItem={roadmapItem}
                                        teams={teams}
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

const RoadmapRow = ({
    roadmapItem,
    onUpdate,
    categories,
    teams,
    config,
}: {
    roadmapItem: GetRoadmapResponse
    onUpdate?: () => void
    categories: string[]
    teams?: GetTeamResponse[]
    config?: SqueakConfig
}) => {
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
        team,
        beta_available,
        image,
        subscribers,
    } = roadmapItem
    const [modalOpen, setModalOpen] = useState(false)
    const [query, setQuery] = useState('')

    const handleSubmit = async (values) => {
        let roadmap
        if (values.image && !values.image.id) {
            const formData = new FormData()
            formData.append('image', values.image)
            const uploadedImage = await fetch('/api/image', {
                method: 'POST',
                body: formData,
            }).then((res) => res.json())
            const { image, ...other } = values
            roadmap = { ...other, imageId: uploadedImage.id }
        } else {
            const { image, ...other } = values
            roadmap = other
        }

        await updateRoadmap(id, roadmap)
        onUpdate && onUpdate()
        setModalOpen(false)
    }

    const handleDelete = async () => {
        await deleteRoadmap(id)
        onUpdate && onUpdate()
    }

    const updateGoalTeam = async (team: GetTeamResponse) => {
        // @ts-expect-error: bigint weirdness
        await updateRoadmap(id, { teamId: parseInt(team.id) })
        onUpdate && onUpdate()
    }

    const filteredTeams =
        query === ''
            ? teams
            : teams?.filter((team) => {
                  return team.name.toLowerCase().includes(query.toLowerCase())
              })

    return (
        <>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <RoadmapForm
                    config={config}
                    onSubmit={handleSubmit}
                    submitText="Update goal"
                    categories={categories}
                    initialValues={{
                        beta_available,
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
                        image,
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
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{subscribers?.length}</td>
                {teams && (
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap relative">
                        <Combobox value={team} onChange={updateGoalTeam}>
                            <div className="relative">
                                <Combobox.Input
                                    displayValue={(team: GetTeamResponse) => team && team.name}
                                    id="team-name"
                                    className="block px-4 py-2 pr-0 border-gray-light border rounded-md w-full"
                                    onChange={(event) => {
                                        setQuery(event.target.value)
                                    }}
                                />
                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </Combobox.Button>
                            </div>
                            <Combobox.Options className="shadow-md rounded-md bg-white absolute w-full z-50">
                                {filteredTeams?.map((team) => (
                                    <Combobox.Option
                                        className="cursor-pointer m-0 py-3 px-2 "
                                        key={team.id.toString()}
                                        value={team}
                                    >
                                        {team.name}
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        </Combobox>
                    </td>
                )}
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
