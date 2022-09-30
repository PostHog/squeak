import { ReactElement, useEffect, useState } from 'react'
import RoadmapTable from 'src/components/RoadmapTable'
import { getRoadmaps } from 'src/lib/api/roadmap'
import { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'
import withAdminAccess from '../util/withAdminAccess'
import { GetRoadmapResponse } from './api/roadmap'

const Roadmaps: NextPageWithLayout = () => {
    const [roadmaps, setRoadmaps] = useState<GetRoadmapResponse[]>([])

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

    return <RoadmapTable onUpdate={handleUpdate} showTeams roadmap={roadmaps} />
}

Roadmaps.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 1200, margin: '0 auto' }} title="Roadmap">
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps() {
        return {
            props: {},
        }
    },
})

export default Roadmaps
