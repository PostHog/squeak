import '../styles/globals.css'

import { UserProvider } from '@supabase/supabase-auth-helpers/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <UserProvider supabaseClient={supabaseClient}>
            <Component {...pageProps} />
        </UserProvider>
    )
}

export default MyApp
