import type { ReactElement } from 'react'
import LoginLayout from '../../layout/LoginLayout'
import type { NextPageWithLayout } from '../../@types/types'
import { useState } from 'react'
import Router from 'next/router'
import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import { GetStaticPropsResult } from 'next'
import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../@types/supabase'

type UserReadonlyProfile = definitions['squeak_profiles_readonly']

interface Props {}

const Profile: NextPageWithLayout<Props> = () => {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [organizationName, setOrganizationName] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        setLoading(true)
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName, organizationName }),
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            setError(errorResponse.error)
            return
        }

        Router.push('/questions')
    }

    return (
        <form className="space-y-6" onSubmit={handleSignup}>
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Complete sign up
                </button>
            </div>
        </form>
    )
}

Profile.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Complete your profile">{page}</LoginLayout>
}

export const getServerSideProps = withMultiTenantCheck({
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const { user } = await getUser(context)

        if (!user) {
            return {
                redirect: {
                    destination: '/signup',
                    permanent: false,
                },
            }
        }

        const { data: userReadonlyProfile } = await supabaseServerClient(context)
            .from<UserReadonlyProfile>('squeak_profiles_readonly')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (userReadonlyProfile && userReadonlyProfile.role) {
            return {
                redirect: {
                    destination: '/questions',
                    permanent: false,
                },
            }
        }

        return {
            props: {},
        }
    },
})

export default Profile
