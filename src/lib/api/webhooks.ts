import { WebhookConfig } from '@prisma/client'
import { CreateWebhookPayload, FetchWebhooksPayload } from '../../pages/api/webhooks'
import { UpdateWebhookPayload } from '../../pages/api/webhooks/[id]'
import { ID } from '../types'
import { doDelete, doGet, doPatch, doPost } from './client'

export function createWebhook(params: CreateWebhookPayload) {
    return doPost<WebhookConfig>('/api/webhooks', params)
}

export function updateWebhook(id: ID, params: UpdateWebhookPayload) {
    return doPatch<WebhookConfig>(`/api/webhooks/${id}`, params)
}

export function deleteWebhook(id: ID) {
    return doDelete(`/api/webhooks/${id}`)
}

export function fetchWebhooks() {
    return doGet<FetchWebhooksPayload[]>('/api/webhooks')
}
