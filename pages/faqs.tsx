import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { definitions } from '../@types/supabase'
import type { NextPageWithLayout } from '../@types/types'
import { QuestionsLayout } from '../components/QuestionsLayout'
import AdminLayout from '../layout/AdminLayout'
import getActiveOrganization from '../util/getActiveOrganization'
import getQuestions from '../util/getQuestions'
import withAdminAccess from '../util/withAdminAccess'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']
type Profile = definitions['squeak_profiles']
type ReplyWithProfile = Pick<Reply, 'body'> & { profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar'> }

interface Question {
    question: Message
    replies: Array<ReplyWithProfile>
}

interface Props {
    results: {
        questions: Array<Question>
        count: number
    }
    start: number
    domain: string | null
}

const Questions: NextPageWithLayout<Props> = ({ results, start, domain }) => {
    return (
        <QuestionsLayout
            title="FAQs"
            noQuestionsMessage={
                <>
                    <h3>No FAQs yet! </h3>
                    <p>Mark any question as frequently asked for it to appear here.</p>
                </>
            }
            domain={domain}
            results={results}
            start={start}
        />
    )
}

Questions.getLayout = function getLayout(page) {
    return (
        <AdminLayout hideTitle title={'Questions'}>
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
    async getServerSideProps(context) {
        const organizationId = await getActiveOrganization(context)
        const start = context.query?.start ? parseInt(context.query?.start as string) : 0
        const {
            data: { company_domain },
        } = await supabaseServerClient(context)
            .from('squeak_config')
            .select('company_domain')
            .eq('organization_id', organizationId)
            .single()

        const { data, error } = await getQuestions(context, { start, organizationId, faq: true })

        if (error) {
            return { props: { error: error.message } }
        }

        return {
            props: {
                results: data,
                start,
                domain: company_domain,
            },
        }
    },
})

export default Questions
