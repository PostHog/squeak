import Head from 'next/head'
import AnimatedLogo from '../components/AnimatedLogo'
import { ReactElement, ReactNode } from 'react'
import usePostHog from '../hooks/usePostHog'

interface Props {
    title?: string
    subtitle?: ReactNode
    children?: React.ReactNode | ReactElement
}

const LoginLayout: React.FC<Props> = ({ title, subtitle, children }) => {
    usePostHog()

    return (
        <div>
            <Head>
                <title>Squeak! | A Q&A widget for your docs</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>

            {/* @ts-ignore */}
            <div className="flex flex-col justify-center min-h-full py-12 sm:px-6 lg:px-8">
                <div className="flex justify-center sm:mx-auto sm:w-full sm:max-w-md">
                    <AnimatedLogo className="w-[600px]" />
                </div>

                {title && <h2 className="text-4xl font-extrabold text-center text-primary-light">{title}</h2>}
                {subtitle}

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {/* @ts-ignore */}
                    <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">{children}</div>
                </div>
            </div>
        </div>
    )
}

export default LoginLayout
