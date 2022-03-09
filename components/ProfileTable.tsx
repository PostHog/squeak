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
        <table>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
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
        <tr>
            <td>{profile.id}</td>
            <td>{profile.first_name ?? 'N/A'}</td>
            <td>{profile.last_name ?? 'N/A'}</td>
            <td>
                {user?.id !== profile.id ? (
                    <select value={role} onChange={(event) => handleRoleChange(event.target.value)}>
                        <option value="admin">admin</option>
                        <option value="moderator">moderator</option>
                        <option value="user">user</option>
                    </select>
                ) : (
                    profile.role
                )}
            </td>
        </tr>
    )
}

export default ProfileTable
