import { ReactElement, useState } from 'react'
import LoginLayout from '../layout/LoginLayout'
import type { NextPageWithLayout } from '../@types/types'
import Link from 'next/link'
import Router from 'next/router'
import { doPost } from '../lib/api'

interface Props {}

const ForgotPassword: NextPageWithLayout<Props> = () => {
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        try {
            await doPost('/api/password/forgot', { email })
        } catch (error) {
            if (error instanceof Error) setError(error.message)
            return
        }

        Router.push('/login')
    }

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
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
                <button
                    type="submit"
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Reset password
                </button>
            </div>

            <div className="text-sm text-center">
                <Link href="/login" passHref>
                    <a className="font-medium text-accent-light hover:text-accent-light">
                        Remembered your password? Sign in instead
                    </a>
                </Link>
            </div>
        </form>
    )
}

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Reset Password">{page}</LoginLayout>
}

export default ForgotPassword
