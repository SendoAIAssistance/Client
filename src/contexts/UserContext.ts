import { createContext, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { User } from '~/app/types/types'
import { toastUtils } from '~/app/utils/ToastAndNavigate'

export interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}

/**
 * Hook để sử dụng ở protected pages
 * Tự động redirect về / nếu user chưa đăng nhập
 */
export function useRequireAuth() {
  const context = useContext(UserContext)
  const navigate = useNavigate()

  if (!context) throw new Error('useRequireAuth must be used within a UserProvider')

  useEffect(() => {
    if (!context.user) {
      toastUtils.error(navigate, 'You have to login to access this page.', '/')
    }
  }, [context.user, navigate])

  return context
}
