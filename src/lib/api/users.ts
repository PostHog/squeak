import { SetupUserRequestPayload, SetupUserResponse } from '../../pages/api/user-setup'
import { doPost } from './client'

export function createUser(email: string, password: string) {
    return doPost('/api/signup', { email, password })
}

export function setupUser(body: SetupUserRequestPayload) {
    return doPost<SetupUserResponse>('/api/user-setup', body)
}
