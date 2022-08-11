import { Organization, User } from '@prisma/client'
import { SafeUser } from '../../lib/auth'
import withPostHog from './withPostHog'

const trackOrganizationSignup = async (
    user: User | SafeUser,
    organization: Organization,
    properties: Record<string | number, unknown>
) => {
    await withPostHog(async (client) => {
        client.groupIdentify({
            groupType: 'organization',
            groupKey: `id:${organization.id}`,
            properties: {
                name: organization.name,
                hosting: process.env.MULTI_TENANCY ? 'multi-tenancy' : 'self-hosted',
                ...properties,
            },
        })

        client.capture({
            distinctId: user.id,
            event: 'organization-sign-up',
            groups: { organization: `id:${organization.id}` },
        })
    })
}

export default trackOrganizationSignup
