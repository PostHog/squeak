import { Question, Reply } from '@prisma/client'
import { getQuestion as fetchQuestion } from '../lib/api'

interface Response {
    question: Question | null
    replies: Array<Reply>
}

const getQuestion = async (id: string | number): Promise<Response> => {
    const { body: question } = await fetchQuestion(id)

    if (!question) {
        return {
            question: null,
            replies: [],
        }
    }

    const { replies } = question
    return { question, replies }
}

export default getQuestion
