import type { Dispatch, SetStateAction } from 'react'
import classNames from 'classnames'

interface Props {
    handleSignup: (e: React.FormEvent<HTMLFormElement>) => void
    error: string | null
    email: string
    setEmail: Dispatch<SetStateAction<string>>
    password: string
    setPassword: Dispatch<SetStateAction<string>>
    className?: string
    ctaText?: string
}

const SignupForm: React.VoidFunctionComponent<Props> = ({
    handleSignup,
    error,
    email,
    setEmail,
    password,
    setPassword,
    className,
    ctaText = 'Sign up',
}) => {
    return (
        <form className={classNames('space-y-6', className)} onSubmit={handleSignup}>
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
                    {ctaText}
                </button>
            </div>
        </form>
    )
}

export default SignupForm
