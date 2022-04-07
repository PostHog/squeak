import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import Router from 'next/router'
import Link from 'next/link'
import { ReactElement, useEffect, useState } from 'react'
import LoginLayout from '../layout/LoginLayout'
import type { NextPageWithLayout } from '../@types/types'
import { GetStaticPropsResult } from 'next'
import useActiveOrganization from '../util/useActiveOrganization'

interface Props {
    isMultiTenancy: boolean
}

const Login: NextPageWithLayout<Props> = () => {
    const { setActiveOrganization } = useActiveOrganization()

    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const { data: subscription } = supabaseClient.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_IN') {
                // Timeout required to allow for the cookie to be set before redirecting
                // TODO(JS): There must be a better way to do this?
                setTimeout(() => {
                    Router.push('/')
                }, 1000)
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const { user, error } = await supabaseClient.auth.signIn({ email, password })

        if (error) {
            setError(error.message)
            return
        }

        if (!user) {
            setError('Invalid email or password')
            return
        }

        await setActiveOrganization(user.id)
    }

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-accent-light focus:ring-orange-500 border-gray-light rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-light">
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link href="/signup" passHref>
                            <a href="#" className="font-medium text-accent-light hover:text-accent-light">
                                sign up for an account
                            </a>
                        </Link>
                    </p>
                )
            }
        >
            {page}
        </LoginLayout>
    )
}

export const getServerSideProps = (): GetStaticPropsResult<Props> => {
    return {
        props: {
            isMultiTenancy: (process.env.MULTI_TENANCY as unknown as boolean) ?? false,
        },
    }
}

export default Login
