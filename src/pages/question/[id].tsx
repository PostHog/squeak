import dynamic from 'next/dynamic'
import superjson from 'superjson'
import { useRouter } from 'next/router'

import EditQuestion from '../../components/question/EditQuestion'
import SlugTable from '../../components/question/SlugTable'
import QuestionTopics from '../../components/QuestionTopics'
import AdminLayout from '../../layout/AdminLayout'
import getActiveOrganization from '../../util/getActiveOrganization'
import { getQuestion } from '../../db/question'
import withAdminAccess from '../../util/withAdminAccess'
import { getConfig } from '../../db'
import { getSessionUser } from '../../lib/auth'
import prisma from 'src/lib/db'

const SingleQuestion: any = dynamic(() => import('squeak-react').then((mod) => mod.Question), { ssr: false })

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
                    <SingleQuestion
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

export const getServerSideProps = withAdminAccess({
    redirectTo: (url) => `/login?redirect=${url}`,
    async getServerSideProps(context) {
        const { id } = context.query
        const user = await getSessionUser(context.req)

        if (!id) {
            return { props: { error: 'We require a question ID to lookup the replies, none provided' } }
        }

        const organizationId = getActiveOrganization(context)
        const question = await getQuestion(parseInt(id as string))

        const topics = await prisma.topic.findMany()

        // We need to do this to properly serialize BigInt's
        const { json: safeQuestion } = superjson.serialize(question)

        const { permalink_base } = (await getConfig(organizationId, {
            permalink_base: true,
        })) as any

        return {
            props: {
                // @ts-ignore
                question: { question: safeQuestion, replies: safeQuestion?.replies },
                topics,
                organizationId,
                permalinkBase: permalink_base || '',
                user,
            },
        }
    },
})

export default Question
