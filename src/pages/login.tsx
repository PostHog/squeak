import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import type { NextPageWithLayout } from '../@types/types'
import LoginLayout from '../layout/LoginLayout'
import { doPost } from '../lib/api'
import { User } from '@prisma/client'
import { getSessionUser } from '../lib/auth'

interface Props {
    isMultiTenancy: boolean
    user: User | null
}

const Login: NextPageWithLayout<Props> = ({ user }) => {
    // FIXME: Remember me has no effect
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            router.push(router.query?.redirect ? router.query?.redirect + '' : '/')
        }
    }, [router])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        try {
            const { body: session } = await doPost('/api/login', {
                email,
                password,
            })

            if (!session) {
                setError('Invalid email or password')
                return
            }

            router.push(router.query?.redirect ? router.query?.redirect + '' : '/')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return
            }
        }
    }

    return (
        <div className="divide-y divide-gray-400 divide-dashed">
            <form className="space-y-6 pb-6" method="post" action="/api/login" onSubmit={handleLogin}>
                <input name="csrfToken" type="hidden" />
                {error && <p className="text-sm font-medium text-center text-red-500">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-gray-light focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-gray-light focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="w-4 h-4 rounded text-accent-light focus:ring-orange-500 border-gray-light"
                        />
                        <label htmlFor="remember-me" className="block ml-2 text-sm text-primary-light">
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link href="/forgot-password" passHref>
                            <a className="font-medium text-accent-light hover:text-accent-light">
                                Forgot your password?
                            </a>
                        </Link>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={!password || !email}
                        className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Sign in
                    </button>
                </div>
            </form>

            <div className="flex flex-col items-center space-y-2 pt-6">
                <span className="text-gray-600">Or login with</span>

                <Link href="/api/auth/github">
                    <a className="inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-orange-100">
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="github"
                            className="w-4 h-4"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>
                        </svg>
                        <span>GitHub</span>
                    </a>
                </Link>
            </div>
        </div>
    )
}

Login.getLayout = function getLayout(page: ReactElement<Props>) {
    return (
        <LoginLayout
            title="Sign in to your account"
            subtitle={
                page.props.isMultiTenancy && (
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Not using Squeak! yet?{' '}
                        <Link href="/signup" passHref>
                            <span className="font-semibold cursor-pointer text-accent-light hover:text-accent-light">
                                Sign up for an account
                            </span>
                        </Link>
                    </p>
                )
            }
        >
            {page}
        </LoginLayout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> {
    const user = await getSessionUser(context.req)

    if (user) {
        return {
            redirect: {
                destination: '/questions',
                permanent: false,
            },
        }
    }

    return {
        props: {
            isMultiTenancy: process.env.MULTI_TENANCY ?? false,
            user,
        },
    }
}

export default Login
