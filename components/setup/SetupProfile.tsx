import Router from 'next/router'
import { useState } from 'react'

import ProfileForm from '../ProfileForm'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import posthog from 'posthog-js'
import { User } from '@prisma/client'
import { doPost } from '../../lib/api'

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
    const [url, setUrl] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        setLoading(true)
        const response = await fetch('/api/setup', {
            method: 'POST',
            body: JSON.stringify({
                firstName,
                lastName,
                organizationName,
                url,
                distinctId: posthog?.get_distinct_id(),
            }),
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            setError(errorResponse.error)
            return
        }

        const { userId, organizationId } = await response.json()

        await setActiveOrganization(userId, organizationId)

        posthog.identify(userId)
        posthog.group('organization', `id:${organizationId}`)

        Router.push('/setup/notifications')
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
                        value={user.email}
                        disabled
                        className="appearance-none block w-full px-3 py-2 bg-gray-100 cursor-not-allowed border border-gray-light rounded-md shadow-sm sm:text-sm"
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
