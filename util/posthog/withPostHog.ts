import PostHog from 'posthog-node'

const withPostHog = async (fn: (client: PostHog) => void) => {
    if ('true' === process.env.NEXT_PUBLIC_OPT_OUT_TRACKING || !process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
        return
    }

    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY as string)
    await fn(client)
    client.shutdown()
}

export default withPostHog
