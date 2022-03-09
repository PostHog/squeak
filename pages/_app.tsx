import '../styles/globals.css'

import { UserProvider } from '@supabase/supabase-auth-helpers/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { AppProps } from 'next/app'
import type { NextPageWithLayout } from '../@types/types'
import ErrorLayout from '../layout/ErrorLayout'

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function Squeak({ Component, pageProps }: AppPropsWithLayout) {
    if (pageProps.error) {
        return <ErrorLayout error={pageProps.error} />
    }

    const getLayout = Component.getLayout || ((page) => page)

    return <UserProvider supabaseClient={supabaseClient}>{getLayout(<Component {...pageProps} />)}</UserProvider>
}

export default Squeak
