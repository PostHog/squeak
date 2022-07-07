import { SqueakConfig } from '@prisma/client'
import { UpdateConfigPayload } from '../../pages/api/config'
import { doGet, doPatch } from './client'

export function getConfig() {
    return doGet<SqueakConfig>('/api/config')
}

export async function updateSqueakConfig(params: UpdateConfigPayload) {
    return doPatch('/api/config', { ...params })
}
