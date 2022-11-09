import classNames from 'classnames'
import { Dispatch, SetStateAction } from 'react'

interface Props {
    handleSignup: (e: React.FormEvent<HTMLFormElement>) => void
    error: string | null
    loading: boolean
    firstName: string
    setFirstName: Dispatch<SetStateAction<string>>
    lastName: string
    setLastName: Dispatch<SetStateAction<string>>
    organizationName: string
    setOrganizationName: Dispatch<SetStateAction<string>>
    url: string
    setUrl: Dispatch<SetStateAction<string>>
    className?: string
    ctaText?: string
}

const ProfileForm: React.VoidFunctionComponent<Props> = ({
    handleSignup,
    error,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    organizationName,
    setOrganizationName,
    url,
    setUrl,
    loading,
    className,
    ctaText = 'Complete sign up',
}) => {
    return (
        <form className={classNames('space-y-6', className)} onSubmit={handleSignup}>
            {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                </label>
                <div className="mt-1">
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                </label>
                <div className="mt-1">
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization name
                </label>
                <div className="mt-1">
                    <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        autoComplete="organization"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Site URL
                </label>
                <div className="mt-1">
                    <input
                        id="url"
                        name="url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        autoComplete="url"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    {ctaText}
                </button>
            </div>
        </form>
    )
}

export default ProfileForm
