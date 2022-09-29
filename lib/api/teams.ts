import { GetTeamResponse } from '../../pages/api/teams'
import { doDelete, doGet, doPatch, doPost } from './client'

export function getTeams() {
    return doGet<GetTeamResponse[]>('/api/teams')
}

export function createTeam(name: string) {
    return doPost<GetTeamResponse>('/api/teams', { name })
}

export function getTeam(id) {
    return doGet<GetTeamResponse>(`/api/team/${id}`)
}

export function updateTeam(id, params) {
    return doPatch<GetTeamResponse>(`/api/team/${id}`, params)
}

export function deleteTeam(id) {
    return doDelete<GetTeamResponse>(`/api/team/${id}`)
}
