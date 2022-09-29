import AdminLayout from '../../layout/AdminLayout'
import withAdminAccess from '../../util/withAdminAccess'
import prisma from '../../lib/db'
import ProfileTable from '../../components/ProfileTable'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import Input from '../../components/Input'
import Select from '../../components/Select'
import { createRoadmap, deleteRoadmap } from '../../lib/api/roadmap'
import getActiveOrganization from '../../util/getActiveOrganization'
import RoadmapTable from '../../components/RoadmapTable'
import { getProfiles, getTeam, getTeams, updateProfile } from '../../lib/api'
import { XIcon } from '@heroicons/react/solid'
import Avatar from '../../components/Avatar'
import { Combobox } from '@headlessui/react'
import uniqBy from 'lodash.groupby'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline'

const AddTeamMember = ({ teamId, onSubmit }) => {
    const [profiles, setProfiles] = useState(null)
    const [profileId, setProfileId] = useState('')
    useEffect(() => {
        getProfiles().then(({ data }) => {
            setProfiles(data)
            setProfileId(data[0]?.id)
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        await updateProfile(profileId, { teamId })
        onSubmit && onSubmit()
    }
    return (
        profiles && (
            <form onSubmit={handleSubmit}>
                <select onChange={(e) => setProfileId(e.target.value)} value={profileId}>
                    {profiles.map((profile) => {
                        return (
                            <option key={profile.id} value={profile.id}>
                                {profile.profile.first_name} {profile.profile.last_name}
                            </option>
                        )
                    })}
                </select>
                <Button className="mt-3">Add</Button>
            </form>
        )
    )
}

export const RoadmapForm = ({ onSubmit, handleDelete, initialValues, submitText = 'Add goal', categories }) => {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [showCategories, setShowCategories] = useState(false)
    const [query, setQuery] = useState('')
    const filteredCategories =
        query === ''
            ? categories
            : categories.filter((category) => {
                  return category.toLowerCase().includes(query.toLowerCase())
              })
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ values, setFieldValue }) => {
                return (
                    <Form>
                        <Input value={values.title} label="Title" id="title" name="title" placeholder="Title" />
                        <Input
                            value={values.description}
                            as={'textarea'}
                            label="Description"
                            name="description"
                            placeholder="Description"
                        />
                        <div className="flex items-center space-x-2 mb-6">
                            <label
                                className="text-[16px] font-semibold opacity-75 flex-shrink-0 m-0"
                                htmlFor="complete"
                            >
                                Complete
                            </label>
                            <Field type="checkbox" name="complete" id="complete" />
                        </div>

                        {values.complete && (
                            <Input
                                value={values.date_completed}
                                label="Date completed"
                                id="date_completed"
                                name="date_completed"
                                placeholder="Date completed"
                                type="date"
                            />
                        )}
                        {!values.complete && (
                            <Input
                                value={values.projected_completion_date}
                                label="Projected completion date"
                                id="projected_completion_date"
                                name="projected_completion_date"
                                placeholder="Projected completion date"
                                type="date"
                            />
                        )}
                        <div className="mb-6">
                            <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={'category'}>
                                Category
                            </label>
                            <Combobox
                                value={values.category}
                                onChange={(category) => setFieldValue('category', category)}
                            >
                                <div className="relative">
                                    <Combobox.Input
                                        id="category"
                                        className="block px-4 py-2 pr-0 border-gray-light border rounded-md w-full"
                                        onChange={(event) => setQuery(event.target.value)}
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </Combobox.Button>
                                </div>
                                <Combobox.Options>
                                    {filteredCategories.map((category) => (
                                        <Combobox.Option
                                            className="cursor-pointer m-0 py-3 px-2 shadow-md rounded-md"
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            </Combobox>
                        </div>

                        {values.github_urls.map((issue, index) => {
                            return (
                                <div className="flex items-center space-x-2">
                                    <div className="flex-grow">
                                        <Input
                                            value={values.github_urls[index]}
                                            label="GitHub URL"
                                            name={`github_urls[${index}]`}
                                            placeholder="GitHub URL"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const issues = [...values.github_urls]
                                            issues.splice(index, 1)
                                            setFieldValue('github_urls', issues)
                                        }}
                                    >
                                        <XIcon className="w-4 text-[red]" />
                                    </button>
                                </div>
                            )
                        })}
                        <button
                            type="button"
                            onClick={() => setFieldValue('github_urls', [...values.github_urls, ''])}
                            className="text-red font-bold mb-6"
                        >
                            Add GitHub URL
                        </button>

                        <div className="flex items-center mt-4 space-x-2 justify-between">
                            {handleDelete && (
                                <Button
                                    onClick={() => {
                                        if (!confirmDelete) return setConfirmDelete(true)
                                        handleDelete()
                                    }}
                                    type="button"
                                >
                                    {confirmDelete ? 'Click to confirm' : 'Delete'}
                                </Button>
                            )}
                            <Button>{submitText}</Button>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    )
}

const Team = ({ id, organizationId, ...other }) => {
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [team, setTeam] = useState(null)
    const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false)
    const handleNewRoadmap = async (values) => {
        const data = await createRoadmap({ ...values, teamId: team.id.toString(), organizationId })
        handleUpdate()
        setCreateModalOpen(false)
    }

    useEffect(() => {
        getTeam(id).then(({ data }) => setTeam(data))
    }, [])

    const handleUpdate = async () => {
        const { data } = await getTeam(id)
        setTeam(data)
    }
    const categories = Object.keys(uniqBy(team?.Roadmap, 'category'))

    return (
        team && (
            <>
                <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                    <RoadmapForm
                        categories={categories}
                        initialValues={{
                            complete: false,
                            github_urls: [],
                            description: '',
                            date_completed: '',
                            projected_completion_date: '',
                            title: '',
                            category: '',
                        }}
                        onSubmit={handleNewRoadmap}
                    />
                </Modal>
                <div className="flex space-x-12">
                    <section className="flex-grow">
                        <div className="flex items-center justify-between mt-6 mb-3">
                            <h1 className="m-0">Roadmap</h1>
                            <Button onClick={() => setCreateModalOpen(true)}>New goal</Button>
                        </div>
                        {team?.Roadmap?.length > 0 && <RoadmapTable onUpdate={handleUpdate} roadmap={team.Roadmap} />}
                    </section>
                    <aside className="max-w-[300px] w-full mt-6">
                        <h3 className="font-bold text-xl">{team.name}</h3>
                        <ul className="list-none m-0 p-0">
                            {team?.profiles?.length > 0 &&
                                team.profiles.map((profile) => {
                                    return (
                                        <li className="flex items-center group">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <Avatar image={profile.avatar} />
                                            </div>
                                            <div className="ml-2 flex items-center justify-between flex-grow">
                                                <div className="text-sm font-semibold text-primary-light">
                                                    {profile.profile.first_name} {profile.profile.last_name}
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        await updateProfile(profile.id, { teamId: 'None' })
                                                        handleUpdate()
                                                    }}
                                                    className="hidden group-hover:block"
                                                >
                                                    <XIcon className="w-4 text-[red]" />
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                        </ul>
                        <div className="mt-4">
                            {!addTeamMemberOpen && (
                                <button onClick={() => setAddTeamMemberOpen(true)} className="text-red font-bold">
                                    Add member
                                </button>
                            )}
                            {addTeamMemberOpen && (
                                <AddTeamMember
                                    onSubmit={() => {
                                        handleUpdate()
                                        setAddTeamMemberOpen(false)
                                    }}
                                    teamId={id}
                                />
                            )}
                        </div>
                    </aside>
                </div>
            </>
        )
    )
}

Team.getLayout = function getLayout(page) {
    return (
        <AdminLayout title={''} hideTitle>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: (url) => `/login?redirect=${url}`,
    async getServerSideProps(context) {
        const organizationId = await getActiveOrganization(context)
        const { id } = context.query
        return {
            props: { organizationId, id },
        }
    },
})

export default Team
