import { Roadmap } from '@prisma/client'
import { doDelete, doGet, doPatch, doPost } from './client'

export function createRoadmap(fields) {
    return doPost<Roadmap>('/api/roadmap', fields)
}

export function updateRoadmap(id, fields) {
    return doPatch<Roadmap>(`/api/roadmap/${id}`, fields)
}

export function getRoadmap(id) {
    return doGet<Roadmap>(`/api/roadmap/${id}`)
}

export function deleteRoadmap(id) {
    return doDelete(`/api/roadmap/${id}`)
}
