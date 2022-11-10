import React, { createContext, useEffect, useState } from 'react'
import { get, post } from '../lib/api'

export const Context = createContext(undefined)
export const Provider = ({
  value: { apiHost, organizationId, profileLink },
  children
}) => {
  const [config, setConfig] = useState({})

  const getConfig = async () => {
    const { data } = await get(apiHost, '/api/config', { organizationId })
    return data
  }

  useEffect(() => {
    getConfig().then((config) => {
      setConfig(config)
    })
  }, [])

  return (
    <Context.Provider value={{ apiHost, organizationId, config, profileLink }}>
      {children}
    </Context.Provider>
  )
}
