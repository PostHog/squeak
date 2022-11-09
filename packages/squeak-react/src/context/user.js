import React, { createContext, useEffect, useState } from 'react'
import { useOrg } from '../hooks/useOrg'
import { get } from '../lib/api'

export const Context = createContext(undefined)
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null)
  const { organizationId, apiHost } = useOrg()

  function getSession() {
    return get(apiHost, '/api/user', { organizationId })
  }

  useEffect(() => {
    getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('ERROR', data.error)
        } else {
          const role = data.profile?.role
          const isModerator = role === 'admin' || role === 'moderator'
          setUser({ ...data, isModerator })
        }
      })
      .catch((err) => {
        console.log('error getting session', err)
      })
  }, [user?.id])

  return (
    <Context.Provider value={{ user, setUser }}>{children}</Context.Provider>
  )
}
