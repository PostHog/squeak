import withAdminAccess from '../util/withAdminAccess'
import { GetStaticPropsResult } from 'next'
import { ReactElement } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { NextPageWithLayout } from '../@types/types'

interface Props {}

const Questions: NextPageWithLayout<Props> = () => {
    return <div>Questions content here</div>
}

Questions.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout title="Questions" subtitle="Manage questions and replies">
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess<Props>({
    redirectTo: '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Questions
