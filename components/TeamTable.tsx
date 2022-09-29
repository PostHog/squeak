import React, { useState } from 'react'
import { Team } from '@prisma/client'
import Link from 'next/link'
import Modal from './Modal'
import { Form, Formik } from 'formik'
import Button from './Button'
import Input from './Input'
import { deleteTeam, updateTeam } from '../lib/api'

const TeamTable = ({ teams, onUpdate }: { teams: Team[]; onUpdate: () => void }) => {
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
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Members
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
                                {teams.map((team) => (
                                    <TeamRow onUpdate={onUpdate} key={String(team.id)} team={team} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const TeamRow = ({ team, onUpdate }: { team: Team; onUpdate: () => void }) => {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const { name, profiles, id } = team

    const handleSubmit = async ({ name }) => {
        await updateTeam(id, { name })
        onUpdate && onUpdate()
        setModalOpen(false)
    }

    const handleDelete = async () => {
        if (!confirmDelete) return setConfirmDelete(true)
        await deleteTeam(id)
        onUpdate && onUpdate()
        setModalOpen(false)
    }

    return (
        <>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Formik
                    initialValues={{
                        name,
                    }}
                    onSubmit={handleSubmit}
                >
                    {({ isValid }) => {
                        return (
                            <Form>
                                <Input label="Name" id="name" name="name" placeholder="Name" />

                                <div className="flex items-center mt-4 space-x-2 justify-between">
                                    <Button onClick={handleDelete} type="button">
                                        {confirmDelete ? 'Click to confirm' : 'Delete'}
                                    </Button>

                                    <Button>Update</Button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </Modal>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <Link href={`/team/${id}`}>{name}</Link>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{profiles?.length || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <button onClick={() => setModalOpen(true)} className="text-red font-bold">
                        Edit
                    </button>
                </td>
            </tr>
        </>
    )
}

export default TeamTable
