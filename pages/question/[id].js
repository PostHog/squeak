import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import EditQuestion from '../../components/question/EditQuestion'
import SlugTable from '../../components/question/SlugTable'
import Topics from '../../components/Topics'
import AdminLayout from '../../layout/AdminLayout'
import getActiveOrganization from '../../util/getActiveOrganization'
import getQuestion from '../../util/getQuestion'
import withAdminAccess from '../../util/withAdminAccess'
import { getQuestion as fetchQuestion } from '../../lib/api/client'
const SingleQuestion = dynamic(() => import('squeak-react').then((mod) => mod.Question), { ssr: false })

const Question = ({ question: initialQuestion, organizationId }) => {
    const [question, setQuestion] = useState(initialQuestion)
    const {
        replies,
        question: { slug, subject, id, published, resolved },
    } = question

    const updateQuestion = async ({ subject, slug, published, resolved }) => {
        setQuestion({ ...question, question: { ...question.question, subject, slug, published, resolved } })
    }

    const handleResolve = (resolved) => {
        updateQuestion({ resolved, slug, subject, published })
    }

    const handleSubmit = async () => {
        const question = await fetchQuestion(id, organizationId)
        setQuestion(question)
    }

    const { user } = useUser()
    supabaseClient.auth.user = () => user

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex items-start col-span-2 space-x-9">
                <div className="flex-grow max-w-[700px]">
                    <SingleQuestion
                        apiHost={`//${typeof window !== 'undefined' && window.location.host}`}
                        organizationId={organizationId}
                        supabase={supabaseClient}
                        onResolve={handleResolve}
                        onSubmit={handleSubmit}
                        question={question}
                    />
                </div>
            </div>
            <div className="max-w-sm mt-12 lg:mt-0">
                <h3 className="mb-4 text-xl font-bold">Shown on:</h3>
                <SlugTable questionId={id} />

                <h3 className="mt-8 mb-2 text-xl font-bold">Topics</h3>
                <Topics organizationId={organizationId} questionId={id} />
                <h3 className="mt-8 mb-4 text-xl font-bold">Question settings</h3>
                <EditQuestion
                    values={{ subject, slug, id, published, resolved }}
                    replyId={replies[0].id}
                    onSubmit={updateQuestion}
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

        if (!id) {
            return { props: { error: 'We require a question ID to lookup the replies, none provided' } }
        }

        const organizationId = getActiveOrganization(context)
        const question = await getQuestion(id)

        const {
            data: { company_domain },
        } = await supabaseServerClient(context)
            .from('squeak_config')
            .select('company_domain')
            .eq('organization_id', organizationId)
            .single()

        const { data: topics } = await supabaseServerClient(context)
            .from('squeak_topics')
            .select('label')
            .eq('organization_id', organizationId)

        return {
            props: { question, domain: company_domain || '', organizationId, topics },
        }
    },
})

export default Question
