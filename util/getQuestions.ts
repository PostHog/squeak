import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { GetServerSidePropsContext, NextApiRequest } from 'next'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
      }

interface Params {
    organizationId: number | string
    published?: boolean
    slug?: string
    start?: number
    perPage?: number
}

const getQuestions = async (context: Context, params: Params) => {
    const { organizationId, start = 0, perPage = 20, published, slug } = params
    const end = start + (perPage - 1)

    const messagesQuery = supabaseServerClient(context)
        .from<Message>('squeak_messages')
        .select('subject, id, slug, created_at, published', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at')

    if (published) messagesQuery.eq('published', published)
    if (slug) messagesQuery.contains('slug', [slug])
    if (start && end) messagesQuery.range(start, end)

    const { data: messages = [], count = 0, error } = await messagesQuery

    if (error) {
        return {
            error,
        }
    }

    return {
        data: {
            questions: await Promise.all(
                (messages || []).map((question) => {
                    return supabaseServerClient(context)
                        .from<Reply>('squeak_replies')
                        .select(
                            `
                         id, body, created_at,
                         profile:squeak_profiles!replies_profile_id_fkey (
                             id, first_name, last_name, avatar, metadata:squeak_profiles_readonly(role)
                        )
                        `
                        )
                        .eq('message_id', question.id)
                        .eq('organization_id', organizationId)
                        .order('created_at')
                        .then((data) => ({
                            question,
                            replies: data?.data || [],
                        }))
                })
            ),
            count: count ?? 0,
        },
    }
}

export default getQuestions
