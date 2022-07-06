import { ID } from '../types'
import { doDelete } from './client'

export function deleteReply(id: ID) {
    return doDelete(`/api/replies/${id}`)
}
