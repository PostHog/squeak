import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import Router from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import LoginLayout from '../../layout/LoginLayout'
import type { NextPageWithLayout } from '../../@types/types'
import Link from 'next/link'
import { GetStaticPropsResult } from 'next'
import withMultiTenantCheck from '../../util/withMultiTenantCheck'

interface Props {}

const Signup: NextPageWithLayout<Props> = () => {
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const { data: subscription } = supabaseClient.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_IN') {
                Router.push('/signup/finish')
            }

            return () => {
                subscription?.unsubscribe()
            }
        })
    }, [])

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const { error } = await supabaseClient.auth.signUp({ email, password })

        if (error) {
            setError(error.message)
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSignup}>
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Sign up
                </button>
            </div>

            <div className="text-center text-sm">
                <Link href="/login" passHref>
                    <a className="font-medium text-orange-600 hover:text-orange-500">
                        Already got an account? Sign in instead
                    </a>
                </Link>
            </div>
        </form>
    )
}

Signup.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Sign up for an account">{page}</LoginLayout>
}

export const getServerSideProps = withMultiTenantCheck({
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Signup
