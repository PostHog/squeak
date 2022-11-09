import PostHog from 'posthog-node'

const withPostHog = async (fn: (client: PostHog) => Promise<void>) => {
    const trackingEnabled = !JSON.parse(process.env.NEXT_PUBLIC_OPT_OUT_TRACKING)

    if (!trackingEnabled || !process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
        return
    }

    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })

    await fn(client)
    client.shutdown()
}

export default withPostHog
