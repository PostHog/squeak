import uniqBy from 'lodash.groupby'
import { ReactElement, useEffect, useState } from 'react'
import Button from 'src/components/Button'
import Modal from 'src/components/Modal'
import RoadmapTable from 'src/components/RoadmapTable'
import { createRoadmap, getRoadmaps } from 'src/lib/api/roadmap'
import { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'
import { withAdminGetStaticProps } from '../util/withAdminAccess'
import { GetRoadmapResponse } from './api/roadmap'
import { RoadmapForm } from './team/[id]'

const Roadmaps: NextPageWithLayout = () => {
    const [modalOpen, setModalOpen] = useState(false)
    const [roadmaps, setRoadmaps] = useState<GetRoadmapResponse[]>([])
    const categories = Object.keys(uniqBy(roadmaps, 'category'))

    useEffect(() => {
        getRoadmaps().then(({ data }) => {
            if (data) {
                setRoadmaps(data)
            }
        })
    }, [])

    const handleUpdate = () => {
        getRoadmaps().then(({ data }) => {
            if (data) {
                setRoadmaps(data)
            }
        })
    }

    const handleNewRoadmap = async (values) => {
        await createRoadmap({ ...values })
        handleUpdate()
        setModalOpen(false)
    }

    return (
        <AdminLayout hideTitle contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Roadmap">
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <RoadmapForm
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
            <div className="flex justify-between items-center mb-3">
                <h1>Roadmap</h1>
                <Button onClick={() => setModalOpen(true)}>New</Button>
            </div>
            <RoadmapTable categories={categories} onUpdate={handleUpdate} showTeams roadmap={roadmaps} />
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: () => '/login',
    async getServerSideProps() {
        return {
            props: {},
        }
    },
})

export default Roadmaps
