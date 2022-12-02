import { SqueakConfig } from '@prisma/client'
import uniqBy from 'lodash.groupby'
import { ReactElement, useEffect, useState } from 'react'
import Button from 'src/components/Button'
import Modal from 'src/components/Modal'
import { RoadmapForm } from 'src/components/RoadmapForm'
import RoadmapTable from 'src/components/RoadmapTable'
import { getConfig } from 'src/lib/api'
import { createRoadmap, getRoadmaps } from 'src/lib/api/roadmap'
import { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'
import { withAdminGetStaticProps } from '../util/withAdminAccess'
import { GetRoadmapResponse } from './api/roadmap'

const Roadmaps: NextPageWithLayout = () => {
    const [modalOpen, setModalOpen] = useState(false)
    const [roadmaps, setRoadmaps] = useState<GetRoadmapResponse[]>([])
    const [config, setConfig] = useState<SqueakConfig>()
    const categories = Object.keys(uniqBy(roadmaps, 'category'))

    useEffect(() => {
        getRoadmaps().then(({ data }) => {
            if (data) {
                setRoadmaps(data)
            }
        })
        getConfig('').then(({ data }) => {
            if (data) {
                setConfig(data)
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
        await createRoadmap(roadmap)
        handleUpdate()
        setModalOpen(false)
    }

    return (
        <AdminLayout hideTitle contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Roadmap">
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
                        image: null,
                    }}
                    onSubmit={handleNewRoadmap}
                />
            </Modal>
            <div className="flex justify-between items-center mb-3">
                <h1>Roadmap</h1>
                <Button onClick={() => setModalOpen(true)}>New</Button>
            </div>
            <RoadmapTable
                config={config}
                categories={categories}
                onUpdate={handleUpdate}
                showTeams
                roadmap={roadmaps}
            />
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
