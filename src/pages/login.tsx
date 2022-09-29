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
    }, [])

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
        <form className="space-y-6" method="post" action="/api/login" onSubmit={handleLogin}>
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
                        <a className="font-medium text-accent-light hover:text-accent-light">Forgot your password?</a>
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
