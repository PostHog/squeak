import AdminLayout from '../../layout/AdminLayout'
import withAdminAccess from '../../util/withAdminAccess'
import prisma from '../../lib/db'
import ProfileTable from '../../components/ProfileTable'

const Question = ({ team }) => {
    console.log(team)
    return (
        <section>
            <ProfileTable teams={null} profiles={team?.profiles} />
        </section>
    )
}

Question.getLayout = function getLayout(page) {
    return (
        <AdminLayout title={page.props?.team.name} contentStyle={{ maxWidth: 1200, margin: '0 auto' }}>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: (url) => `/login?redirect=${url}`,
    async getServerSideProps(context) {
        const { id } = context.query

        const team = await prisma.team.findFirst({
            where: {
                id: parseInt(id as string),
            },
            include: {
                profiles: {
                    include: {
                        profile: true,
                        Team: true,
                    },
                },
            },
        })

        return {
            props: { team },
        }
    },
})

export default Question
