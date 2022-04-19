import { NextPageWithLayout } from '../@types/types'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import LoginLayout from '../layout/LoginLayout'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { useToasts } from 'react-toast-notifications'
import Router from 'next/router'

type Profile = definitions['squeak_profiles']
type ProfileReadonly = definitions['squeak_profiles_readonly']

interface Props {}

const Profile: NextPageWithLayout<Props> = () => {
    const { addToast } = useToasts()
    const { user, isLoading } = useUser()

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    const loadProfile = useCallback(async () => {
        if (!user) {
            return
        }

        const { data } = await supabaseClient
            .from('squeak_profiles_readonly')
            .select('id, profile:squeak_profiles(first_name, last_name)')
            .eq('user_id', user?.id || '')
            .limit(1)
            .single()

        setFirstName(data?.profile?.first_name)
        setLastName(data?.profile?.last_name)
    }, [user])

    const handleSave = async () => {
        if (!user) {
            return
        }

        const { error } = await supabaseClient.auth.update({ password })

        if (error) {
            setError(error.message)
            return
        }

        const { data: profile, error: profileFetchError } = await supabaseClient
            .from<ProfileReadonly>('squeak_profiles_readonly')
            .select('profile_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        if (!profile || profileFetchError) {
            setError('Error updating user profile')
        }

        const { error: profileUpdateError } = await supabaseClient
            .from<Profile>('squeak_profiles')
            .update({ first_name: firstName, last_name: lastName })
            .match({ id: profile?.profile_id })

        if (profileUpdateError) {
            setError(profileUpdateError.message)
            return
        }

        addToast('Your profile has been updated', { appearance: 'success' })
        Router.push('/login')
    }

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <p>User not found</p>
    }

    return (
        <div className="space-y-6">
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
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="mt-1">
                    <input
                        id="lastName"
                        name="lastName"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="family-name"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-light rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>
            <button
                onClick={handleSave}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                Save
            </button>
        </div>
    )
}

Profile.getLayout = function getLayout(page: ReactElement<Props>) {
    return <LoginLayout title="Edit profile">{page}</LoginLayout>
}

export default Profile
