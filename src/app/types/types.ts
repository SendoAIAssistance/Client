import type { InternalAxiosRequestConfig } from 'axios'

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

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  errors?: Record<string, string[]> | null
  status?: number
  timestamp: string
}

export interface QueueItem {
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}

export interface ApiError {
  success: false
  data: null
  message: string
  errors?: Record<string, string[]> | null
  status: number
  timestamp: string
}

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
  message: string
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  tokenType?: string
}

export interface UserSession {
  user: User
  tokens: AuthTokens
}

export interface RequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Re-export axios types for convenience
export type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
