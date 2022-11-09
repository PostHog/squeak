import { doPatch, doDelete, doGet, QueryParams, doPost } from './client'
import { ID } from '../types'
import { Question, Reply } from '@prisma/client'
import { CreateQuestionRequestPayload } from '../../pages/api/question'
import { UpdateQuestionRequestPayload } from '../../pages/api/question/[id]'

export function deleteQuestion(id: ID) {
    return doDelete(`/api/question/${id}`)
}

export function createQuestion(params: CreateQuestionRequestPayload) {
    return doPost('/api/question', params)
}

export function getQuestion(id: ID, fields?: string) {
    const params: QueryParams = {}

    if (fields) {
        params.fields = fields
    }
    return doGet<Question & { replies: Reply[] }>(`/api/question/${id}`, params)
}

export function updateQuestion(id: ID, params: UpdateQuestionRequestPayload) {
    return doPatch<Question>(`/api/question/${id}`, params)
}

export function getQuestionTopics(id: ID) {
    return doGet<any>(`/api/question/${id}/topics`)
}

export function updateQuestionTopics(id: ID, topics: string[]) {
    return doPatch(`/api/question/${id}/topics`, { topics })
}
