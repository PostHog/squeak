import { User } from '@prisma/client'
import { SafeUser } from '../../lib/auth'
import withPostHog from './withPostHog'

const trackUserSignup = async (user: User | SafeUser, properties: Record<string | number, unknown> = {}) => {
    await withPostHog(async (client) => {
        client.capture({
            distinctId: user.id,
            event: 'user-sign-up',
            properties: {
                $set: {
                    email: user.email,
                    ...properties,
                },
            },
        })
    })
}

export default trackUserSignup
