import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthContextType, User } from '../types/types'
import { apiClient } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import { useNavigate } from 'react-router'
import { toastUtils } from '../utils/ToastAndNavigate'

const authContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete apiClient.defaults.headers.common['Authorization']
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  const login = useCallback((access_token: string, refresh_token: string, userData: User) => {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setAccessToken(access_token)
    setRefreshToken(refresh_token)
    setUser(userData)
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null))
  }, [])

  // Verify user authentication
  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const res = await apiClient.get(endPoints.auth.me)
      const userData = res?.data?.user

      if (userData) {
        setAccessToken(token)
        setUser(userData as User)
      } else if (res?.data?.success === false) {
        logout()
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  // Initialize on mount
  useEffect(() => {
    verifyUser()
  }, [verifyUser])

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    logout,
    verifyUser,
    updateUser
  }

  return <authContext.Provider value={value}>{children}</authContext.Provider>
}
//cai tien thanh role sau
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(authContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRequireAuth() {
  const context = useContext(authContext)
  const navigate = useNavigate()

  if (!context) throw new Error('useRequireAuth must be used within an AuthProvider')

  useEffect(() => {
    if (!context.user) {
      toastUtils.error(navigate, 'You have to login to access this page.', '/')
    }
  }, [context.user, navigate])

  return context
}
