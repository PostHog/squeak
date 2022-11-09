import Link from 'next/link'

import type { NextPageWithLayout } from '../@types/types'
import Surface from '../components/Surface'
import AdminLayout from '../layout/AdminLayout'
import { useRouter } from 'next/router'
import getQuestions from '../util/getQuestions'
import { withAdminGetStaticProps } from '../util/withAdminAccess'
import QuestionsTable, { QuestionTableRow } from '../components/QuestionsTable'

interface Props {
    results: {
        questions: Array<QuestionTableRow>
        count: number
    }
    start: number
    totalCount: number
}

const Questions: NextPageWithLayout<Props> = ({ results, start, totalCount }) => {
    const router = useRouter()
    const { questions } = results

    return (
        <AdminLayout hideTitle title={'Questions'}>
            <h1 className="mb-2">
                Questions <span className="text-[14px] opacity-50 font-semibold">by date</span>
            </h1>
            {questions.length <= 0 ? (
                <Surface className="max-w-[700px]">
                    <h3>No questions yet! </h3>
                    <p>
                        Check back later or <Link href="/slack">import from Slack</Link>.
                    </p>
                </Surface>
            ) : (
                <QuestionsTable
                    start={start}
                    perPage={20}
                    total={totalCount}
                    questions={questions}
                    nextPage={() => {
                        // FIXME: If the number of questions % 20 === 0 then this will fail
                        if (questions.length === 20) {
                            router.replace({
                                query: {
                                    ...router.query,
                                    start: start + 20,
                                },
                            })
                        }
                    }}
                    prevPage={() =>
                        router.replace({
                            query: {
                                ...router.query,
                                start: Math.max(start - 20, 0),
                            },
                        })
                    }
                />
            )}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps<Props>({
    redirectTo: () => '/login',
    async getServerSideProps(context, user) {
        const start = context.query?.start ? parseInt(context.query?.start as string) : 0
        const profileId = context.query?.profile_id as string

        const { data, totalCount } = await getQuestions(context, {
            start,
            organizationId: user.organizationId,
            profileId,
        })

        return {
            props: {
                results: data,
                start,
                totalCount,
            },
        }
    },
})

export default Questions
