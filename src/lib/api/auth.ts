import { doPost } from './client'

export function logout() {
    return doPost('/api/logout')
}
