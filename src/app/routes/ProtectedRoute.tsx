import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

import { useUser } from '~/contexts/UserContext'
import { toastUtils } from '../utils/ToastAndNavigate'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const navigate = useNavigate()
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    if (!user && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      toastUtils.error(navigate, 'You have to login to access this page.', '/')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  return children
}
