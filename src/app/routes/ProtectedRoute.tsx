import { useRequireAuth } from '../providers/AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useRequireAuth()

  if (!user) {
    return null
  }

  return children
}
