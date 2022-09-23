import { Team } from '@prisma/client'
import { doGet, doPost } from './client'

export function getTeams() {
    return doGet<Team[]>('/api/teams')
}

export function createTeam(name: string) {
    return doPost<Team>('/api/teams', { name })
}

export function getTeam(id) {
    return doGet<Team>(`/api/team/${id}`)
}
