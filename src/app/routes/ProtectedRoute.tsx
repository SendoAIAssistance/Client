import { useNavigate } from 'react-router'
import { useUser } from '~/contexts/UserContext'
import { toastUtils } from '../utils/ToastAndNavigate'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const navigate = useNavigate()

  if (!user) {
    toastUtils.error(navigate, 'You have to login to access this page.', '/')
  }

  return children
}
