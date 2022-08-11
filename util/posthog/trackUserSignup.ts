import { User } from '@prisma/client'
import { SafeUser } from '../../lib/auth'
import withPostHog from './withPostHog'

const trackUserSignup = async (
    user: User | SafeUser,
    prevDistinctId?: string,
    properties: Record<string | number, unknown> = {}
) => {
    await withPostHog(async (client) => {
        client.identify({
            distinctId: user.id,
            properties: {
                email: user.email,
                ...properties,
            },
        })

        if (prevDistinctId) {
            client.alias({ distinctId: user.id, alias: prevDistinctId })
        }

        client.capture({ distinctId: user.id, event: 'user-sign-up' })
    })
}

export default trackUserSignup
