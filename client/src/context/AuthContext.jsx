import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false) // true once we know if someone is logged in

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (email, password) => {
    const u = await api.login({ email, password })
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (name, email, password) => {
    const u = await api.register({ name, email, password })
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await api.logout().catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, ready, isAdmin: user?.role === 'ADMIN', login, register, logout }),
    [user, ready, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
