import '@fontsource/nunito'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/800.css'

import type { AppProps } from 'next/app'
import { ToastProvider } from 'react-toast-notifications'

import type { NextPageWithLayout } from '../@types/types'
import Toast from '../components/Toast'
import { UserProvider } from '../contexts/user'
import ErrorLayout from '../layout/ErrorLayout'
import '../styles/globals.css'

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function Squeak({ Component, pageProps }: AppPropsWithLayout) {
    if (pageProps.error) {
        return <ErrorLayout error={pageProps.error} />
    }

    const getLayout = Component.getLayout || ((page) => page)

    return (
        <UserProvider user={pageProps.user}>
            <ToastProvider newestOnTop autoDismiss components={{ Toast: Toast }}>
                {getLayout(<Component {...pageProps} />)}
            </ToastProvider>
        </UserProvider>
    )
}

export default Squeak
