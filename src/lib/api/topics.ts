import { Topic, TopicGroup } from '@prisma/client'
import { GetTopicGroupsResponse } from '../../pages/api/topic-groups'
import { GetTopicsResponse } from '../../pages/api/topics'
import { ID } from '../types'
import { doDelete, doGet, doPatch, doPost } from './client'

export function getTopics(organizationId: string) {
    return doPost<GetTopicsResponse[]>('/api/topics', { organizationId })
}

export function createTopic(label: string, topicGroupId?: Pick<Topic, 'topicGroupId'>) {
    return doPost<Topic>('/api/topics/create', { label, topicGroupId })
}

export function deleteTopic(id: ID) {
    return doDelete(`/api/topics/${id}`)
}

export function patchTopic({
    organizationId,
    id,
    topicGroupId,
}: {
    organizationId: string
    id: ID
    topicGroupId: string | null
}) {
    return doPatch<GetTopicGroupsResponse[]>(`/api/topics/${id}`, { organizationId, id, topicGroupId })
}

export function createTopicGroup(label: string) {
    return doPost<TopicGroup>('/api/topic-groups', { label })
}

export function getTopicGroups(organizationId: string) {
    return doGet<GetTopicGroupsResponse[]>('/api/topic-groups', { organizationId })
}
