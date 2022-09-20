import { Team } from '@prisma/client'
import { Form, Formik } from 'formik'
import { GetStaticPropsResult } from 'next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import TeamTable from '../components/TeamTable'
import AdminLayout from '../layout/AdminLayout'
import { ApiResponseError } from '../lib/api'
import { createTeam, getTeams } from '../lib/api/teams'
import withAdminAccess from '../util/withAdminAccess'

interface Props {}

const Teams: NextPageWithLayout<Props> = () => {
    const { addToast } = useToasts()
    const [teams, setTeams] = useState<Team[]>([])
    const [modalOpen, setModalOpen] = useState(false)

    const fetchTeams = useCallback(async () => {
        try {
            const { data } = await getTeams()
            if (!data) {
                addToast('Error fetching teams')
                return
            }
            setTeams(data)
        } catch (err) {
            if (err instanceof ApiResponseError) {
                addToast(err.message, { appearance: 'error' })
            }
        }
    }, [addToast])

    const handleAddTeam = async (name) => {
        await createTeam(name)
        fetchTeams()
        setModalOpen(false)
    }

    useEffect(() => {
        fetchTeams()
    }, [fetchTeams])

    return (
        <>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Formik
                    initialValues={{ name: '' }}
                    validateOnMount
                    validate={(values) => {
                        const errors: {
                            name?: string
                        } = {}
                        if (!values.name) {
                            errors.name = 'Required'
                        }

                        return errors
                    }}
                    onSubmit={({ name }) => handleAddTeam(name)}
                >
                    {() => {
                        return (
                            <Form>
                                <Input label="Team name" placeholder="Team name" id="team-name" name="name" />
                                <Button type="submit">Create team</Button>
                            </Form>
                        )
                    }}
                </Formik>
            </Modal>
            <div className="flex justify-between items-center mb-3">
                <h1>Teams</h1>
                <Button onClick={() => setModalOpen(true)}>New</Button>
            </div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <TeamTable teams={teams} />
            </div>
        </>
    )
}

Teams.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Teams" hideTitle>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Teams
