import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthContextType, User } from '../types/types'
import { apiClient } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'

const authContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const loadToken = () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setAccessToken(token)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Optional: decode JWT để lấy user nhanh (không verify)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload.user || payload)
      } catch {
        // Invalid token format
        setUser(null)
      }
    }
  }

  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const res = await apiClient.get(endPoints.auth.me)
      if (res && 'success' in res && res?.data?.user) {
        setUser(res.data.user as User)
      } else {
        logout()
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Có thể thêm refresh token ở đây nếu cần
      }
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadToken()
    verifyUser()
  }, [verifyUser])

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token)
    setAccessToken(token)
    setUser(userData)
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete apiClient.defaults.headers.common['Authorization']
    setAccessToken(null)
    setUser(null)
  }

  return (
    <authContext.Provider value={{ user, accessToken, login, logout, loading, verifyUser }}>
      {children}
    </authContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(authContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
