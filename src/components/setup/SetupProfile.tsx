import Router from 'next/router'
import { useState } from 'react'
import posthog from 'posthog-js'
import { User } from '@prisma/client'

import ProfileForm from '../ProfileForm'
import { setupProfile } from '../../lib/api/setup'

interface Props {
    user: User
}

const SetupProfile: React.VoidFunctionComponent<Props> = ({ user }) => {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [url, setUrl] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        setLoading(true)
        try {
            const { data } = await setupProfile({
                firstName,
                lastName,
                organizationName,
                url,
                distinctId: posthog?.get_distinct_id(),
            })

            if (!data) return

            const { userId, organizationId } = data

            posthog.identify(userId)
            posthog.group('organization', `id:${organizationId}`)

            Router.push('/setup/notifications')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return
            }
        }
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-primary-light">Complete profile</h2>

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
                        value={user.email || ''}
                        disabled
                        className="block w-full px-3 py-2 bg-gray-100 border rounded-md shadow-sm appearance-none cursor-not-allowed border-gray-light sm:text-sm"
                    />
                </div>
            </div>

            <ProfileForm
                url={url}
                setUrl={setUrl}
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
