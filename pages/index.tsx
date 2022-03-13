import { GetStaticPropsResult } from 'next'
import { ReactElement } from 'react'
import type { NextPageWithLayout } from '../@types/types'
import AdminLayout from '../layout/AdminLayout'
import withAdminAccess from '../util/withAdminAccess'
import CodeSnippet from '../components/CodeSnippet'

interface Props {}

const Home: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <h3>Snippet</h3>

            <p>
                Great news! You're all setup to receive questions on your site. Here's the snippet if you need to put it
                on other pages.
            </p>

            <CodeSnippet className="max-w-6xl" />
        </div>
    )
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout title="Squeak">{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess<Props>({
    redirectTo: '/login',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Home
