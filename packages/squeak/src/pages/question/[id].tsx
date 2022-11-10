import superjson from 'superjson'
import { useRouter } from 'next/router'

import EditQuestion from '../../components/question/EditQuestion'
import SlugTable from '../../components/question/SlugTable'
import QuestionTopics from '../../components/QuestionTopics'
import AdminLayout from '../../layout/AdminLayout'
import { getQuestion } from '../../db/question'
import { withAdminGetStaticProps } from '../../util/withAdminAccess'
import { getConfig } from '../../db'
import prisma from 'src/lib/db'
import dynamic from 'next/dynamic'

const SqueakQuestion: any = dynamic(
    // @ts-ignore
    import('squeak-react').then((mod) => mod.Question),
    {
        ssr: false,
    }
)

const Question = ({ question, topics: allTopics, organizationId, permalinkBase }) => {
    const router = useRouter()
    const {
        replies,
        question: { subject, id, published, resolved, permalink, topics },
    } = question

    const refreshQuestion = () => {
        router.replace(router.asPath)
    }

    const apiHost = `${typeof window !== 'undefined' && window.location.origin}`

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex items-start col-span-2 space-x-9">
                <div className="flex-grow max-w-[700px]">
                    <SqueakQuestion
                        apiHost={apiHost}
                        organizationId={organizationId}
                        onResolve={refreshQuestion}
                        onSubmit={refreshQuestion}
                        question={question}
                    />
                </div>
            </div>
            <div className="max-w-sm mt-12 lg:mt-0">
                <h3 className="mb-4 text-xl font-bold">Shown on:</h3>
                <SlugTable questionId={id} />

                <QuestionTopics questionId={id} allTopics={allTopics} topics={topics.map(({ topic }) => topic)} />

                <h3 className="mt-8 mb-4 text-xl font-bold">Question settings</h3>
                <EditQuestion
                    permalinkBase={permalinkBase}
                    values={{ subject, id, published, resolved, permalink }}
                    replyId={replies[0].id}
                    onSubmit={refreshQuestion}
                />
            </div>
        </div>
    )
}

Question.getLayout = function getLayout(page) {
    const title = page?.props?.question?.question?.subject || 'Question'

    return (
        <AdminLayout title={title} contentStyle={{ maxWidth: 1200, margin: '0 auto' }} hideTitle>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps<any>({
    redirectTo: (url) => `/login?redirect=${url}`,
    async getServerSideProps(context, user) {
        const { id } = context.query

        if (!id) {
            return { props: { error: 'We require a question ID to lookup the replies, none provided' } }
        }

        const question = await getQuestion(parseInt(id as string))

        const topics = await prisma.topic.findMany()

        // We need to do this to properly serialize BigInt's
        const { json: safeQuestion } = superjson.serialize(question)

        const { permalink_base } = (await getConfig(user?.organizationId, {
            permalink_base: true,
        })) as any

        return {
            props: {
                // @ts-ignore
                question: { question: safeQuestion, replies: safeQuestion?.replies },
                topics,
                organizationId: user.organizationId,
                permalinkBase: permalink_base || '',
                user,
            },
        }
    },
})

export default Question
