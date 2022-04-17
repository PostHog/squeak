import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'

type Question = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

interface Response {
    question: Question | null
    replies: Array<Reply>
}

const getQuestion = async (id: string | number): Promise<Response> => {
    const { data: question } = await supabaseClient
        .from<Question>('squeak_messages')
        .select('subject, id, slug, created_at, published, resolved')
        .eq('id', id)
        .limit(1)
        .single()

    if (!question) {
        return {
            question: null,
            replies: [],
        }
    }

    return supabaseClient
        .from<Reply>('squeak_replies')
        .select(
            `
                id,
                created_at,
                body,
                profile:squeak_profiles!replies_profile_id_fkey (
                    first_name, last_name, avatar
                )
                `
        )
        .eq('message_id', question.id)
        .order('created_at')
        .then((data) => ({
            question: question,
            replies: data.data || [],
        }))
}

export default getQuestion
