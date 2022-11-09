import { Roadmap } from '@prisma/client'
import { GetRoadmapResponse } from 'src/pages/api/roadmap'
import { doDelete, doGet, doPatch, doPost } from './client'

export function createRoadmap(fields) {
    return doPost<GetRoadmapResponse>('/api/roadmap', fields)
}

export function updateRoadmap(id, fields) {
    return doPatch<GetRoadmapResponse>(`/api/roadmap/${id}`, fields)
}

export function getRoadmap(id) {
    return doGet<GetRoadmapResponse>(`/api/roadmap/${id}`)
}

export function getRoadmaps() {
    return doGet<GetRoadmapResponse[]>(`/api/roadmap`)
}

export function deleteRoadmap(id) {
    return doDelete(`/api/roadmap/${id}`)
}
