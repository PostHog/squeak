declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_OPT_OUT_TRACKING: string
            NEXT_PUBLIC_POSTHOG_API_KEY?: string
            NEXT_PUBLIC_POSTHOG_HOST?: string
            DATABASE_URL?: string
            MULTI_TENANCY?: boolean
        }
    }
}

export {}
