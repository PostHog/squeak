import { Prisma } from '@prisma/client'
import { GetStaticPropsResult, NextPage } from 'next'
import dateToDays from 'src/util/dateToDays'

import AdminLayout from 'src/layout/AdminLayout'
import { withAdminGetStaticProps } from 'src/util/withAdminAccess'
import prisma from 'src/lib/db'
import Avatar from 'src/components/Avatar'
import QuestionsTable from 'src/components/QuestionsTable'

const Users: NextPage<Props> = ({ profile }) => {
    const { first_name, last_name, avatar, created_at, user, squeak_messages: questions } = profile || {}

    const name = first_name || last_name ? `${first_name ?? ''} ${last_name ?? ''}` : 'Anonymous'
    const createdAt = dateToDays(created_at)

    return (
        <AdminLayout hideTitle title={`Profile - ${name}`}>
            <div className="md:flex md:items-center md:justify-between md:space-x-5 mt-8">
                <div className="flex items-start space-x-5">
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <Avatar image={avatar} />
                            <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                        {user?.email && <p className="font-medium text-gray-500">{user?.email}</p>}
                        <p className="text-sm font-medium text-gray-500">
                            Joined{' '}
                            <time dateTime="2020-08-25">
                                {createdAt === 0 ? 'today' : createdAt === 1 ? '1 day ago' : `${createdAt} days ago`}
                            </time>
                        </p>
                    </div>
                </div>
            </div>

            <QuestionsTable
                total={questions.length}
                start={0}
                perPage={questions.length}
                questions={questions.map((question) => {
                    return {
                        question,
                        profile,
                    }
                })}
            />
        </AdminLayout>
    )
}

type Props = {
    profile: Prisma.ProfileGetPayload<{
        include: {
            user: {
                select: {
                    email: true
                }
            }
            squeak_messages: true
        }
    }>
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: () => '/login',
    async getServerSideProps(ctx): Promise<GetStaticPropsResult<Props>> {
        const { id } = ctx.params || {}

        if (!id) {
            throw 'No id found in URL'
        }

        const profile = await prisma.profile.findUnique({
            where: { id: id as string },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
                squeak_messages: true,
            },
        })

        if (!profile) {
            return {
                notFound: true,
            }
        } else {
            return {
                props: {
                    profile,
                },
            }
        }
    },
})

export default Users
