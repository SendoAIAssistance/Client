import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthContextType, User } from '../types/types'
import { apiClient } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import { useNavigate } from 'react-router'
import { toastUtils } from '../utils/ToastAndNavigate'

const authContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refresh_token'))
  const [loading, setLoading] = useState<boolean>(() => {
    const token = !!localStorage.getItem('access_token')
    const user = !!localStorage.getItem('user')
    return token && !user // true nếu có token nhưng chưa có user
  })

  useEffect(() => {
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    }
  }, [accessToken])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete apiClient.defaults.headers.common['Authorization']
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser
      const updatedUser = { ...prevUser, ...userData } as User
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    })
  }, [])

  // Verify user authentication
  const verifyUser = useCallback(
    async (force: boolean = false) => {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const cachedUser = localStorage.getItem('user')

      if (!force && cachedUser) {
        setLoading(false)
        return
      }

      if (!token) {
        setLoading(false)
        return
      }

      try {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const res = await apiClient.get(endPoints.auth.me)

        if (!res?.data?.user || res?.data?.success === false) {
          logout()
          return
        }

        const { _id, email, name } = res.data.user
        const userData = {
          id: _id,
          email,
          name
        }

        setUser(userData as User)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          logout()
        }
      } finally {
        setLoading(false)
      }
    },
    [logout]
  )

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const cachedUser = localStorage.getItem('user')

    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

      if (!cachedUser) {
        verifyUser()
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    (access_token: string, refresh_token: string) => {
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      setAccessToken(access_token)
      setRefreshToken(refresh_token)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      // Verify user after setting tokens
      verifyUser()
    },
    [verifyUser]
  )

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
    if (!context.loading && !context.user) {
      toastUtils.error(navigate, 'You have to login to access this page.', '/')
    }
  }, [context.user, navigate, context.loading])

  return context
}
