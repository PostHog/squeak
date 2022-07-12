import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import { GetServerSidePropsContext, NextApiRequest } from 'next'
import { definitions } from '../@types/supabase'

type Message = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
      }

interface Params {
    organizationId: string
    published?: boolean
    slug?: string
    start?: number
    perPage?: number
    topic?: string
}

const getQuestions = async (context: Context, params: Params) => {
    const { organizationId, start = 0, perPage = 20, published, slug, topic } = params
    const end = start + (perPage - 1)

    const messagesQuery = supabaseServerClient(context)
        .from<Message>('squeak_messages')
        .select(
            'subject, id, slug, created_at, published, slack_timestamp, resolved, resolved_reply_id, permalink, topics',
            {
                count: 'exact',
            }
        )
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

    if (published) messagesQuery.eq('published', published)
    if (slug) messagesQuery.contains('slug', [slug])
    if (topic) messagesQuery.contains('topics', [topic])
    messagesQuery.range(start, end)

    const { data: messages = [], count = 0, error } = await messagesQuery

    if (error) {
        return {
            error,
        }
    }

    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const {
        data: { show_slack_user_profiles },
    } = await supabaseServiceRoleClient
        .from('squeak_config')
        .select('show_slack_user_profiles')
        .eq('organization_id', organizationId)
        .single()

    return {
        data: {
            questions: await Promise.all(
                (messages || []).map((question) => {
                    const repliesQuery = supabaseServerClient(context)
                        .from<Reply>('squeak_replies')
                        .select(
                            `
                         id, body, created_at, published,
                         profile:squeak_profiles!replies_profile_id_fkey (
                             id, first_name, last_name, avatar, metadata:squeak_profiles_readonly(role, slack_user_id)
                        )
                        `
                        )
                        .eq('message_id', question.id)
                        .eq('organization_id', organizationId)
                        .order('created_at', { ascending: true })

                    return repliesQuery.then((data) => {
                        let replies = data?.data || []
                        if (!show_slack_user_profiles) {
                            replies = replies.map((reply) => {
                                // @ts-ignore
                                return reply?.profile?.metadata[0]?.slack_user_id ? { ...reply, profile: null } : reply
                            })
                        }
                        return {
                            question,
                            replies,
                        }
                    })
                })
            ),
            count: count ?? 0,
        },
    }
}

export default getQuestions
