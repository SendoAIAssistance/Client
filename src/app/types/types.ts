export interface User {
  id: string
  email: string
  name: string
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (token: string, userData: User) => void
  logout: () => void
  loading: boolean
  verifyUser: () => Promise<void>
}
