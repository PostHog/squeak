import PostHog from 'posthog-node'

const withPostHog = async (fn: (client: PostHog) => void) => {
    const trackingEnabled = !JSON.parse(process.env.NEXT_PUBLIC_OPT_OUT_TRACKING)

    if (!trackingEnabled || !process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
        return
    }

    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY)
    await fn(client)
    client.shutdown()
}

export default withPostHog
