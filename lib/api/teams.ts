import { Team } from '@prisma/client'
import { doDelete, doGet, doPatch, doPost } from './client'

export function getTeams() {
    return doGet<Team[]>('/api/teams')
}

export function createTeam(name: string) {
    return doPost<Team>('/api/teams', { name })
}

export function getTeam(id) {
    return doGet<Team>(`/api/team/${id}`)
}

export function updateTeam(id, params) {
    return doPatch<Team>(`/api/team/${id}`, params)
}

export function deleteTeam(id) {
    return doDelete<Team>(`/api/team/${id}`)
}
