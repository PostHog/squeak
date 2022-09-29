import { Reply } from '@prisma/client'
import { UpdateReplyPayload } from '../../pages/api/replies/[id]'
import { ID } from '../types'
import { doDelete, doPatch } from './client'

export function deleteReply(id: ID) {
    return doDelete(`/api/replies/${id}`)
}

export function updateReply(id: ID, params: UpdateReplyPayload) {
    return doPatch<Reply>(`/api/replies/${id}`, params)
}
