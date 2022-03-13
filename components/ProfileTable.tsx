import React, { useState } from 'react'
import { definitions } from '../@types/supabase'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'

type ProfileReadonly = definitions['squeak_profiles_readonly']
type Profile = definitions['squeak_profiles_view']

interface TableProps {
    profiles: Array<Profile>
}

const ProfileTable: React.VoidFunctionComponent<TableProps> = ({ profiles }) => {
    return (
        <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 h-16">
                <tr>
                    <th scope="col" className="p-2 text-left font-semibold whitespace-nowrap">
                        User ID
                    </th>
                    <th scope="col" className="p-2 text-left font-semibold whitespace-nowrap">
                        First Name
                    </th>
                    <th scope="col" className="p-2 text-left font-semibold whitespace-nowrap">
                        Last Name
                    </th>
                    <th scope="col" className="p-2 text-left font-semibold whitespace-nowrap">
                        Role
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {profiles.map((profile) => (
                    <ProfileRow key={profile.id} profile={profile} />
                ))}
            </tbody>
        </table>
    )
}

interface RowProps {
    profile: Profile
}

const ProfileRow: React.VoidFunctionComponent<RowProps> = ({ profile }) => {
    const { user } = useUser()
    const [role, setRole] = useState(profile.role)

    const handleRoleChange = async (role: string) => {
        await supabaseClient
            .from<ProfileReadonly>('squeak_profiles_readonly')
            .update({ role })
            .match({ id: profile.id })

        // TODO(JS): Handle errors

        setRole(role)
    }

    return (
        <tr className="h-16">
            <td className="p-2 text-left whitespace-nowrap">{profile.id}</td>
            <td className="p-2 text-left whitespace-nowrap">{profile.first_name ?? 'N/A'}</td>
            <td className="p-2 text-left whitespace-nowrap">{profile.last_name ?? 'N/A'}</td>
            <td className="p-2 text-left whitespace-nowrap">
                {user?.id !== profile.id ? (
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
