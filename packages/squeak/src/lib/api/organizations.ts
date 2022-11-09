import { GetOrganizationsResponse } from '../../pages/api/organizations'
import { doGet } from './client'

export function getUserOrganizations() {
    return doGet<GetOrganizationsResponse[]>('/api/organizations')
}
