import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../utils/api.jsx'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('pf_user')) } catch { return null } })
  const [token, setToken] = useState(() => localStorage.getItem('pf_token'))

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('pf_token', data.token)
    localStorage.setItem('pf_user', JSON.stringify(data.user))
    setToken(data.token); setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (form) => {
    const { data } = await api.post('/auth/register', form)
    localStorage.setItem('pf_token', data.token)
    localStorage.setItem('pf_user', JSON.stringify(data.user))
    setToken(data.token); setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pf_token'); localStorage.removeItem('pf_user')
    setToken(null); setUser(null)
  }, [])

  const isAdmin = user?.role === 'Admin'
  const isManager = user?.role === 'Manager' || isAdmin

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin, isManager, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
