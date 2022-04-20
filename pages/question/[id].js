import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import EditQuestion from '../../components/question/EditQuestion'
import AdminLayout from '../../layout/AdminLayout'
import getActiveOrganization from '../../util/getActiveOrganization'
import getQuestion from '../../util/getQuestion'
import withAdminAccess from '../../util/withAdminAccess'
const SingleQuestion = dynamic(() => import('squeak-react').then((mod) => mod.Question), { ssr: false })

const Question = ({ question: initialQuestion, domain, organizationId }) => {
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
        const question = await getQuestion(id)
        setQuestion(question)
    }

    const { user } = useUser()
    supabaseClient.auth.user = () => user

    return (
        <>
            <h1 className="m-0">{subject}</h1>
            <ul className="flex items-center space-x-2">
                {question.question.slug?.map((slug) => {
                    const url = domain ? new URL(domain).origin : ''
                    const questionLink = url + slug.trim()

                    return (
                        <li key={questionLink}>
                            <span className="text-[14px] opacity-50 text-inherit">Appears on: </span>
                            <a
                                href={url}
                                target="_blank"
                                className="text-[14px] opacity-50 text-inherit"
                                rel="noreferrer"
                            >
                                {questionLink}
                            </a>
                        </li>
                    )
                })}
            </ul>
            <div className="grid lg:grid-cols-3 grid-cols-1 gap-8">
                <div className="flex space-x-9 items-start col-span-2">
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
                <div className="mt-12 lg:mt-0 max-w-sm">
                    <h3 className="font-bold mb-4 text-xl">Thread options</h3>
                    <EditQuestion
                        values={{ subject, slug, id, published, resolved }}
                        replyId={replies[0].id}
                        onSubmit={updateQuestion}
                    />
                </div>
            </div>
        </>
    )
}

Question.getLayout = function getLayout(page) {
    const title = page?.props?.question?.question?.subject || 'Question'
    return (
        <AdminLayout title={title} hideTitle={true} contentStyle={{ maxWidth: 1200, margin: '0 auto' }}>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
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

        return {
            props: { question, domain: company_domain || '', organizationId },
        }
    },
})

export default Question
