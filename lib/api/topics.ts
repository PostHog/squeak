import { Topic } from '@prisma/client'
import { GetTopicsResponse } from '../../pages/api/topics'
import { ID } from '../types'
import { doDelete, doPost } from './client'

export function getTopics(organizationId: string) {
    return doPost<GetTopicsResponse>('/api/topics', { organizationId })
}

export function createTopic(label: string) {
    return doPost<Topic>('/api/topics/create', { label })
}

export function deleteTopic(id: ID) {
    return doDelete(`/api/topics/${id}`)
}
