import Head from 'next/head'
import Logo from '../components/Logo'
import { ReactNode } from 'react'

interface Props {
    title?: string
    subtitle?: ReactNode
}

const LoginLayout: React.FunctionComponent<Props> = ({ title, subtitle, children }) => {
    return (
        <div>
            <Head>
                <title>Squeak! | A Q&A widget for your docs</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>

            <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="flex justify-center sm:mx-auto sm:w-full sm:max-w-md">
                    <Logo className="w-40" />
                </div>

                {title && <h2 className="mt-6 text-center text-2xl font-extrabold text-primary-light">{title}</h2>}
                {subtitle}

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
                </div>
            </div>
        </div>
    )
}

export default LoginLayout
