import { NextPageWithLayout } from '../@types/types'
import { ReactElement, useState } from 'react'
import LoginLayout from '../layout/LoginLayout'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useToasts } from 'react-toast-notifications'
import Router from 'next/router'
import { Profile as UserProfile, User } from '@prisma/client'
import { getSessionUser } from '../lib/auth'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import prisma from '../lib/db'
import { ApiResponseError, doPatch } from '../lib/api'
import { useUser } from '../contexts/user'

interface Props {
    user: User
    profile: UserProfile
}

const Profile: NextPageWithLayout<Props> = ({ user, profile }) => {
    const { addToast } = useToasts()
    const { isLoading } = useUser()

    const [firstName, setFirstName] = useState<string>(profile.first_name || '')
    const [lastName, setLastName] = useState<string>(profile.last_name || '')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    const handleSave = async () => {
        try {
            await doPatch('/api/profile', {
                first_name: firstName,
                last_name: lastName,
                password,
            })
            addToast('Your profile has been updated', { appearance: 'success' })
            Router.push('/login')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError(error as string)
            }

            return
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <p>User not found</p>
    }

    return (
        <div className="space-y-6">
            {error && <p className="text-sm font-medium text-center text-red-500">{error}</p>}
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
                        className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-gray-light focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-gray-light focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                        className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-gray-light focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                </div>
            </div>
            <button
                onClick={handleSave}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-accent-light hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                Save
            </button>
        </div>
    )
}

Profile.getLayout = function getLayout(page: ReactElement<Props>) {
    return <LoginLayout title="Edit profile">{page}</LoginLayout>
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> {
    const user = await getSessionUser(context.req)
    const profilero = await prisma.profileReadonly.findFirst({
        where: { user_id: user.id },
    })
    const profile = await prisma.profile.findUnique({
        where: { id: profilero?.profile_id },
    })

    if (!user || !profile) {
        return {
            redirect: { destination: '/login', permanent: false },
        }
    }
    return {
        props: {
            user,
            profile,
        },
    }
}

export default Profile
