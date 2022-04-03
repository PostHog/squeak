import React, { useState } from 'react'
import { definitions } from '../@types/supabase'
import Avatar from './Avatar'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useToasts } from 'react-toast-notifications'

type Profile = definitions['squeak_profiles_view']
type ProfileReadonly = definitions['squeak_profiles_readonly']

interface TableProps {
    profiles: Array<Profile>
}

const ProfileTable: React.VoidFunctionComponent<TableProps> = ({ profiles }) => {
    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {profiles.map((profile) => (
                                    <ProfileRow key={profile.profile_id} profile={profile} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface RowProps {
    profile: Profile
}

const ProfileRow: React.VoidFunctionComponent<RowProps> = ({ profile }) => {
    const { addToast } = useToasts()
    const { user } = useUser()
    const [role, setRole] = useState(profile.role)

    const handleRoleChange = async (role: string) => {
        const { error } = await supabaseClient
            .from<ProfileReadonly>('squeak_profiles_readonly')
            .update({ role })
            .match({ profile_id: profile.profile_id })

        if (error) {
            addToast(error.message, { appearance: 'error', autoDismiss: true })
            return
        }

        setRole(role)
    }

    const { first_name, last_name, avatar } = profile

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <Avatar image={avatar} />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {first_name || last_name ? `${first_name ?? ''} ${last_name ?? ''}` : 'Anonymous'}
                        </div>
                        {/* <div className="text-sm text-gray-500">{person.email}</div> */}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user?.id !== profile.user_id ? (
                    <select value={role} onChange={(event) => handleRoleChange(event.target.value)}>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>
                ) : (
                    profile.role
                )}
            </td>
        </tr>
    )
}

export default ProfileTable
