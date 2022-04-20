import withPostHog from './withPostHog'
import { User } from '@supabase/gotrue-js'

const capture = async (
    event: string,
    user?: User,
    properties?: Record<string | number, unknown>,
    groups?: Record<string, string | number>
) => {
    if (!user) {
        return
    }

    await withPostHog((client) => client.capture({ distinctId: user.id, event, properties, groups }))
}

export default capture
