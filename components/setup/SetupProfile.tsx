import ProfileForm from '../ProfileForm'
import { useState } from 'react'
import Router from 'next/router'
import { User } from '@supabase/gotrue-js'
import useActiveOrganization from '../../util/useActiveOrganization'

interface Props {
    user: User
}

const SetupProfile: React.VoidFunctionComponent<Props> = ({ user }) => {
    const { setActiveOrganization } = useActiveOrganization()

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [organizationName, setOrganizationName] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        setLoading(true)
        const response = await fetch('/api/setup', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName, organizationName }),
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            setError(errorResponse.error)
            return
        }

        const { organizationId } = await response.json()

        await setActiveOrganization(organizationId)

        Router.push('/setup/notifications')
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-900">Complete profile</h2>

            <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <div className="mt-1 mb-6">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="none"
                        value={user.email}
                        disabled
                        className="appearance-none block w-full px-3 py-2 bg-gray-100 cursor-not-allowed border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                </div>
            </div>

            <ProfileForm
                handleSignup={handleSignup}
                error={error}
                loading={loading}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                organizationName={organizationName}
                setOrganizationName={setOrganizationName}
                ctaText="Complete profile"
            />
        </>
    )
}

export default SetupProfile
