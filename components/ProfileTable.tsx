import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications'

import Avatar from './Avatar'
import { updateProfile } from '../lib/api'
import { ApiResponseError } from '../lib/api/client'
import { GetProfilesProfile, GetProfilesResponse } from '../pages/api/profiles'
import { useUser } from '../contexts/user'

interface TableProps {
    profiles: GetProfilesResponse
}

const ProfileTable: React.VoidFunctionComponent<TableProps> = ({ profiles }) => {
    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b shadow border-gray-light-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {profiles.map((profile) => (
                                    <ProfileRow key={String(profile.id)} profile={profile} />
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
    profile: GetProfilesProfile
}

const ProfileRow: React.VoidFunctionComponent<RowProps> = ({ profile }) => {
    const { addToast } = useToasts()
    const { user } = useUser()
    const [role, setRole] = useState(profile.role)

    const handleRoleChange = async (role: string) => {
        if (!profile.id) {
            return
        }
        try {
            await updateProfile(profile.id, { role })
            setRole(role)
        } catch (err) {
            if (err instanceof ApiResponseError) {
                addToast(err.message, { appearance: 'error' })
                return
            }
        }
    }

    const { first_name, last_name, avatar } = profile?.profile

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                        <Avatar image={avatar} />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-primary-light">
                            {first_name || last_name ? `${first_name ?? ''} ${last_name ?? ''}` : 'Anonymous'}
                        </div>
                        {/* <div className="text-sm text-gray-500">{person.email}</div> */}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
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
