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

const AddTeamMember = ({ teamId, onSubmit }) => {
    const [profiles, setProfiles] = useState(null)
    const [profileId, setProfileId] = useState('')
    useEffect(() => {
        getProfiles().then(({ data }) => {
            setProfiles(data)
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
                            <option value={profile.id}>
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

export const RoadmapForm = ({ onSubmit, handleDelete, initialValues, submitText = 'Add goal' }) => {
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
                        <Input
                            value={values.category}
                            label="Category"
                            id="category"
                            placeholder="Feature request"
                            name="category"
                        />
                        {values.github_issues.map((issue, index) => {
                            return (
                                <div className="flex items-center space-x-2">
                                    <div className="flex-grow">
                                        <Input
                                            value={values.github_issues[index]}
                                            label="GitHub issue number"
                                            name={`github_issues[${index}]`}
                                            placeholder="1234"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const issues = [...values.github_issues]
                                            issues.splice(index, 1)
                                            setFieldValue('github_issues', issues)
                                        }}
                                    >
                                        <XIcon className="w-4 text-[red]" />
                                    </button>
                                </div>
                            )
                        })}
                        <button
                            type="button"
                            onClick={() => setFieldValue('github_issues', [...values.github_issues, ''])}
                            className="text-red font-bold mb-6"
                        >
                            Add GitHub issue
                        </button>

                        <div className="flex items-center mt-4 space-x-2 justify-between">
                            {handleDelete && (
                                <Button onClick={handleDelete} type="button">
                                    Delete
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

    return (
        team && (
            <>
                <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                    <RoadmapForm
                        initialValues={{
                            complete: false,
                            github_issues: [],
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
                        <h3 className="font-bold text-xl">Members</h3>
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
