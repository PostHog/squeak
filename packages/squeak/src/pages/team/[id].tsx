import AdminLayout from '../../layout/AdminLayout'
import { withAdminGetStaticProps } from '../../util/withAdminAccess'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import Input from '../../components/Input'
import { createRoadmap } from '../../lib/api/roadmap'
import RoadmapTable from '../../components/RoadmapTable'
import { getConfig, getProfiles, getTeam, updateProfile } from '../../lib/api'
import { XIcon } from '@heroicons/react/solid'
import Avatar from '../../components/Avatar'
import { Combobox } from '@headlessui/react'
import uniqBy from 'lodash.groupby'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { GetProfilesResponse } from '../api/profiles'
import _ from 'lodash'
import { GetTeamResponse } from '../../pages/api/teams'
import ImageUpload from 'src/components/ImageUpload'
import { SqueakConfig } from '@prisma/client'
import { RoadmapForm } from 'src/components/RoadmapForm'

const AddTeamMember = ({ teamId, onSubmit }) => {
    const [profiles, setProfiles] = useState<GetProfilesResponse[] | null | undefined>(null)
    const [profile, setProfile] = useState<GetProfilesResponse>()
    const [query, setQuery] = useState('')
    useEffect(() => {
        getProfiles().then(({ data }) => {
            setProfiles(data)
            const profile = data && data[0]
            profile && setProfile(profile)
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        profile && (await updateProfile(profile.id, { teamId }))
        onSubmit && onSubmit()
    }

    const filteredProfiles =
        query === ''
            ? profiles
            : profiles?.filter((profile) => {
                  const name = `${profile.first_name} ${profile.last_name}`
                  return name.toLowerCase().includes(query.toLowerCase())
              })

    return profiles ? (
        <form onSubmit={handleSubmit}>
            <Combobox value={profile} onChange={(value) => setProfile(value)}>
                <div className="relative">
                    <Combobox.Input
                        displayValue={(profile: GetProfilesResponse) =>
                            profile && `${profile.first_name} ${profile.last_name || ''}`
                        }
                        id="category"
                        className="block px-4 py-2 pr-0 border-gray-light border rounded-md w-full"
                        onChange={(event) => {
                            setQuery(event.target.value)
                        }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>
                </div>
                <Combobox.Options className="shadow-md rounded-md bg-white">
                    {filteredProfiles?.map((profile) => (
                        <Combobox.Option
                            className="cursor-pointer m-0 py-3 px-2 "
                            key={profile.id.toString()}
                            value={profile}
                        >
                            {profile.first_name} {profile.last_name || ''}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>

            <Button className="mt-3">Add</Button>
        </form>
    ) : null
}

const Team = ({ id }) => {
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [team, setTeam] = useState<GetTeamResponse | null | undefined>(null)
    const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false)
    const [config, setConfig] = useState<SqueakConfig>()
    const handleNewRoadmap = async (values) => {
        await createRoadmap({ ...values, teamId: team?.id.toString() })
        handleUpdate()
        setCreateModalOpen(false)
    }

    useEffect(() => {
        getTeam(id).then(({ data }) => setTeam(data))
        getConfig('').then(({ data }) => {
            if (data) {
                setConfig(data)
            }
        })
    }, [])

    const handleUpdate = async () => {
        const { data } = await getTeam(id)
        setTeam(data)
    }
    const categories = Object.keys(uniqBy(team?.Roadmap, 'category'))

    return (
        team && (
            <AdminLayout title={''} hideTitle>
                <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                    <RoadmapForm
                        config={config}
                        handleDelete={null}
                        categories={categories}
                        initialValues={{
                            complete: false,
                            github_urls: [],
                            description: '',
                            date_completed: '',
                            projected_completion_date: '',
                            title: '',
                            category: '',
                            milestone: false,
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
                        {team?.Roadmap?.length > 0 && (
                            <RoadmapTable
                                config={config}
                                categories={categories}
                                onUpdate={handleUpdate}
                                roadmap={team.Roadmap}
                            />
                        )}
                    </section>
                    <aside className="max-w-[300px] w-full mt-6">
                        <h3 className="font-bold text-xl">{team.name}</h3>
                        <ul className="list-none m-0 p-0">
                            {team?.profiles?.length > 0 &&
                                team.profiles.map((profile) => {
                                    return (
                                        <li key={profile.id.toString()} className="flex items-center group">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <Avatar image={profile.avatar} />
                                            </div>
                                            <div className="ml-2 flex items-center justify-between flex-grow">
                                                <div className="text-sm font-semibold text-primary-light">
                                                    {profile.first_name} {profile.last_name}
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
            </AdminLayout>
        )
    )
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: (url) => `/login?redirect=${url}`,
    async getServerSideProps(context, user) {
        const { id } = context.query

        return {
            props: { organizationId: user.organizationId, id },
        }
    },
})

export default Team
