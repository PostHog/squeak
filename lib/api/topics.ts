import { Topic } from '@prisma/client'
import { GetTopicsResponse } from '../../pages/api/topics'
import { ID } from '../types'
import { doDelete, doGet, doPost } from './client'

export function getTopics() {
    return doGet<GetTopicsResponse>('/api/topics')
}

export function createTopic(label: string) {
    return doPost<Topic>('/api/topics', { body: { label } })
}

export function deleteTopic(id: ID) {
    return doDelete(`/api/topics/${id}`)
}
