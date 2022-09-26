import { User } from '@prisma/client'
import withPostHog from './withPostHog'

const capture = async (
    event: string,
    user?: User,
    properties?: Record<string | number, unknown>,
    groups?: Record<string, string | number>
) => {
    if (!user) {
        return
    }

    await withPostHog(async (client) => client.capture({ distinctId: user.id, event, properties, groups }))
}

export default capture
