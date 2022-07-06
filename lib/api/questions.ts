import { ApiResponse, doPatch, doDelete, doGet } from './client'
import { ID } from '../types'
import { UpdateQuestionParams } from '../../db/question'
import { Question, Reply } from '@prisma/client'
import { GetQuestionTopicsResponse } from '../../pages/api/question/[id]/topics'

export function deleteQuestion(id: ID) {
    return doDelete(`/api/question/${id}`)
}

export function getQuestion(id: ID) {
    return doGet<Question & { replies: Reply[] }>(`/api/question/${id}`)
}

export function updateQuestion(id: ID, params: UpdateQuestionParams): Promise<ApiResponse> {
    return doPatch(`/api/question/${id}`, { body: params })
}

export function getQuestionTopics(id: ID) {
    return doGet<GetQuestionTopicsResponse>(`/api/question/${id}/topics`)
}

export function updateQuestionTopics(id: ID, topics: string[]) {
    return doPatch(`/api/question/${id}/topics`, { body: { topics } })
}
