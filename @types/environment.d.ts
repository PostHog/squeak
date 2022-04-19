declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_SUPABASE_URL: string
            NEXT_PUBLIC_SUPABASE_ANON_KEY: string
            NEXT_PUBLIC_OPT_OUT_TRACKING: string
            NEXT_PUBLIC_POSTHOG_API_KEY: string
            SUPABASE_SERVICE_ROLE_KEY: string
            DATABASE_URL?: string
            MULTI_TENANCY?: boolean
        }
    }
}

export {}
