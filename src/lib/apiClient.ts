import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { env } from './env'
import type { QueueItem, ApiResponse, InternalAxiosRequestConfig, AxiosResponse } from '~/app/types/types'
import { endPoints } from './endPoints'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)))
  failedQueue = []
}

function createErrorResponse(status: number, message: string, errors: any = null): ApiResponse {
  return {
    success: false,
    data: null,
    message: message || 'Request error',
    errors,
    status,
    timestamp: new Date().toISOString()
  }
}

function handleLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  setTimeout(() => (window.location.href = '/'), 300)
}

function handleStatusError(status: number, message: string) {
  switch (status) {
    case 400:
      toast.error(message || 'Yêu cầu không hợp lệ')
      break
    case 401:
      toast.error(message || 'Xác thực thất bại')
      break
    case 403:
      toast.error(message || 'Bạn không có quyền truy cập')
      setTimeout(() => (window.location.href = '/403'), 1000)
      break
    case 404:
      toast.error(message || 'Không tìm thấy dữ liệu')
      break
    case 422:
      toast.error(message || 'Dữ liệu không hợp lệ')
      break
    case 429:
      toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.')
      break
    case 500:
    case 502:
    case 503:
    case 504:
      toast.error(message || 'Lỗi máy chủ. Vui lòng thử lại sau.')
      setTimeout(() => (window.location.href = '/500'), 1500)
      break
    default:
      if (status >= 400) toast.error(message || 'Đã có lỗi xảy ra')
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData && config.headers?.['Content-Type']) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)
//tránh refresh token khi gọi api auth
const isAuthEndpoints = (url?: string) =>
  url ? Object.values(endPoints.auth).some((ep) => url.toLowerCase().startsWith(ep.toLowerCase())) : false

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return response
    }

    response.data = {
      success: true,
      ...payload,
      timestamp: new Date().toISOString()
    }
    return response
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!error.response) {
      toast.error('Không thể kết nối đến server')
      return Promise.reject(createErrorResponse(0, error.message || 'Network error'))
    }

    const { status } = error.response
    const data = error.response.data as any
    const message = data?.message || error.message || ''
    const errors = data?.errors || null

    const isTokenExpired = status === 401 && /expired|token|invalid/i.test(message.toLowerCase())

    if (isTokenExpired && !originalRequest._retry) {
      if (isAuthEndpoints(originalRequest.url)) {
        handleLogout()
        return Promise.reject(createErrorResponse(status, message, errors))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        processQueue(new Error('No refresh token'))
        handleLogout()
        return Promise.reject(createErrorResponse(401, 'No refresh token'))
      }

      try {
        const res = await apiClient.post(endPoints.auth.refreshToken, { refreshToken }, { timeout: 10000 })
        const newToken = res.data?.accessToken || res.data?.access_token

        if (!newToken) throw new Error('No access token returned')

        localStorage.setItem('access_token', newToken)
        const newRefresh = res.data?.refreshToken || res.data?.refresh_token
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        processQueue(null, newToken)
        return apiClient(originalRequest)
      } catch (refreshErr: any) {
        processQueue(refreshErr)
        const refreshStatus = refreshErr.response?.status
        if (refreshStatus === 401 || refreshStatus === 403) {
          toast.error('Phiên đăng nhập không còn hợp lệ')
        } else {
          toast.error('Không thể làm mới phiên')
        }
        handleLogout()
        return Promise.reject(createErrorResponse(401, 'Session expired'))
      } finally {
        isRefreshing = false
      }
    }

    if (!originalRequest._retry) {
      handleStatusError(status, message)
    }

    return Promise.reject(createErrorResponse(status, message, errors))
  }
)

// ───────────────────────────────────────────────
// Streaming helpers
// ───────────────────────────────────────────────

/** Create streaming request using fetch */
export async function createStreamingRequest(
  url: string,
  data: Record<string, any>,
  options?: { signal?: AbortSignal; onError?: (err: Error) => void }
): Promise<Response> {
  const token = localStorage.getItem('access_token')
  const base = apiClient.defaults.baseURL || ''
  const fullUrl = base + (url.startsWith('/') ? url : '/' + url)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
      signal: options?.signal
    })

    if (!res.ok) {
      let msg = 'Request failed'
      try {
        const errData = await res.json()
        msg = errData.message || msg
      } catch {
        // ignore JSON parse errors
      }

      const err = new Error(msg)

      if (res.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn')
        handleLogout()
      } else if (res.status === 403) {
        toast.error('Không có quyền truy cập')
        setTimeout(() => (window.location.href = '/403'), 800)
      } else if (res.status >= 500) {
        toast.error('Lỗi máy chủ')
        setTimeout(() => (window.location.href = '/500'), 1200)
      } else {
        toast.error(msg)
      }

      options?.onError?.(err)
      throw err
    }

    return res
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      toast.error(
        err.name === 'TypeError' && !navigator.onLine ? 'Mất kết nối internet' : 'Không thể kết nối đến server'
      )
    }
    options?.onError?.(err)
    throw err
  }
}

/** Đọc stream từng chunk */
export async function readStream(
  response: Response,
  onChunk: (text: string) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body not readable')

  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete?.()
        break
      }
      onChunk(decoder.decode(value, { stream: true }))
    }
  } catch (err: any) {
    onError?.(err)
    throw err
  } finally {
    reader.releaseLock()
  }
}

export async function fetchThinkingStream(
  messageId: string,
  onChunk: (text: string) => void,
  onComplete?: () => void
): Promise<void> {
  const response = await createStreamingRequest(
    endPoints.ai.getResults,
    { messageId },
    { onError: (err) => console.error('Thinking stream error:', err) }
  )

  await readStream(response, onChunk, onComplete)
}

export default apiClient
