import { doPost } from './client'

interface SetupProfileResponse {
    userId: string
    organizationId: string
}

export function setupProfile(body: Record<string, unknown>) {
    return doPost<SetupProfileResponse>('/api/setup', body)
}
