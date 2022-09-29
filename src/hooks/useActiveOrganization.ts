import { parseCookies, setCookie } from 'nookies'
import { getUserOrganizations } from '../lib/api/'

export const SQUEAK_ORG_ID_COOKIE_KEY = 'squeak_organization_id'

const useActiveOrganization = () => {
    const setActiveOrganization = async (userId: string, organizationId?: string) => {
        if (organizationId) {
            setCookie(null, SQUEAK_ORG_ID_COOKIE_KEY, `${organizationId}`, { path: '/', sameSite: 'none' })
            return
        }

        // Get the users organizations, and set the first one as the active organization (as a cookie)
        // TODO(JS): In the future, we may want to allow the user to select which organization they want to use upon login

        const { body: organizations } = await getUserOrganizations()

        if (!organizations || organizations.length === 0) return

        // get the first organization
        const [organization] = organizations

        setCookie(null, SQUEAK_ORG_ID_COOKIE_KEY, `${organization.organization_id}`, { path: '/', sameSite: 'none' })
    }

    const getActiveOrganization = (): string => {
        const { squeak_organization_id } = parseCookies()

        return squeak_organization_id
    }

    return {
        setActiveOrganization,
        getActiveOrganization,
    }
}

export default useActiveOrganization
