import { SqueakConfig } from '@prisma/client'
import { UpdateConfigPayload } from '../../pages/api/config'
import { doGet, doPatch } from './client'

export function getConfig(organizationId: string) {
    return doGet<SqueakConfig>('/api/config', { organizationId })
}

export async function updateSqueakConfig(params: UpdateConfigPayload) {
    return doPatch('/api/config', { ...params })
}
