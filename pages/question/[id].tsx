import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useState } from 'react'
import AdminLayout from '../../layout/AdminLayout'
import getActiveOrganization from '../../util/getActiveOrganization'
import withAdminAccess from '../../util/withAdminAccess'
import { NextPageWithLayout } from '../../@types/types'
import getQuestion from '../../util/getQuestion'
import { definitions } from '../../@types/supabase'
import ReplyComponent from '../../components/question/Reply'
import EditQuestion from '../../components/question/EditQuestion'

type Question = definitions['squeak_messages']
type Reply = definitions['squeak_replies']
type Profile = definitions['squeak_profiles']

interface Props {
    question: {
        question: Question
        replies: Array<Reply & { profile: Profile }>
    }
    domain: string
}

const Question: NextPageWithLayout<Props> = ({ question: initialQuestion, domain }) => {
    const [question, setQuestion] = useState(initialQuestion)
    const {
        replies,
        question: { slug, subject, id, published, resolved },
    } = question

    const updateQuestion = async ({
        subject,
        slug,
        published,
        resolved,
    }: Pick<Question, 'subject' | 'slug' | 'published' | 'resolved'>) => {
        setQuestion({ ...question, question: { ...question.question, subject, slug, published, resolved } })
    }

    return (
        <>
            <h1 className="m-0">{subject}</h1>
            <ul className="flex items-center space-x-2">
                {question.question.slug?.map((slug) => {
                    const url = domain ? new URL(domain).origin : ''
                    const questionLink = url + (slug as string).trim()

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
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,_300px)]">
                <div className="flex space-x-9 items-start lg:mr-8 xl:mr-16">
                    <div className="flex-grow max-w-[700px]">
                        <div className="">
                            <ReplyComponent reply={replies[0]} profile={replies[0].profile} hideDelete />
                        </div>
                        <div className="grid gap-y-4">
                            {replies.slice(1).map((reply) => {
                                return <ReplyComponent key={reply.id} reply={reply} profile={reply.profile} />
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-12 lg:mt-0 max-w-sm">
                    <h3 className="font-bold mb-4 text-xl">Thread options</h3>
                    <EditQuestion values={{ subject, slug, id, published, resolved }} onSubmit={updateQuestion} />
                </div>
            </div>
        </>
    )
}

Question.getLayout = function getLayout(page) {
    const title = page?.props?.question?.question?.subject || 'Question'
    return (
        <AdminLayout title={title} hideTitle={true} contentStyle={{}}>
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
        const question = await getQuestion(id as string)

        const {
            data: { company_domain },
        } = await supabaseServerClient(context)
            .from('squeak_config')
            .select('company_domain')
            .eq('organization_id', organizationId)
            .single()

        return {
            props: { question, domain: company_domain || '' },
        }
    },
})

export default Question
