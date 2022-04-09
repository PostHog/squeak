import type { User } from '@supabase/gotrue-js'
import withPostHog from './withPostHog'

const trackUserSignup = async (user: User, properties: Record<string | number, unknown>) => {
    await withPostHog(async (client) => {
        client.identify({
            distinctId: user.id,
            properties: {
                email: user.email,
                ...properties,
            },
        })

        client.capture({ distinctId: user.id, event: 'user-sign-up' })
    })
}

export default trackUserSignup
