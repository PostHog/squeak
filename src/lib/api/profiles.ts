import { Profile } from '@prisma/client'
import { GetProfilesResponse } from '../../pages/api/profiles'
import { UpdateProfilePayload } from '../../pages/api/profiles/[id]'
import { ID } from '../types'
import { doGet, doPatch } from './client'

export function updateProfile(id: ID, params: UpdateProfilePayload) {
    return doPatch<Profile>(`/api/profiles/${id}`, params)
}

export function getProfiles() {
    return doGet<GetProfilesResponse[]>('/api/profiles')
}
