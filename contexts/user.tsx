import { User } from '@prisma/client'
import React, { createContext, useContext, useState } from 'react'
import useSWR from 'swr'
import { performRequest } from '../lib/api'

interface IUserContext {
    user: User | null
    status: string
    isLoading: boolean
    setUser: (user: User) => void
}

export const UserContext = createContext<IUserContext | null>(null)

const fetcher = async (url: string) => {
    const res = await performRequest(url, 'GET')

    if (res.status === 401) {
        return { user: null }
    }
    const data = await res.json()
    return { user: data }
}

interface IUserProvider {
    children: React.ReactNode
    user: User | null
}

export const UserProvider: React.FC<IUserProvider> = ({ children, user: initialUser }) => {
    const { data, error } = useSWR(initialUser ? null : '/api/user', fetcher)

    let status
    if (initialUser) {
        status = 'ready'
    } else {
        status = !data ? 'loading' : error ? 'error' : 'ready'
    }

    const [user, setUser] = useState<User | null>(initialUser)
    const value = {
        user,
        setUser,
        status,
        isLoading: status === 'loading',
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('no user context!')
    return context
}
