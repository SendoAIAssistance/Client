import axios from 'axios'
import { env } from './env'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Nếu payload là FormData, bỏ Content-Type mặc định để axios tự thêm boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type']
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    const payload = response?.data
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return payload
    }
    return {
      success: true,
      data: payload,
      message: '',
      timestamp: new Date().toISOString()
    }
  },
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status || 0
    const message = error?.response?.data?.message || ''

    // Kiểm tra xem có phải lỗi token expired không
    const isTokenExpired =
      status === 401 && (message.toLowerCase().includes('expired') || message.toLowerCase().includes('token'))

    // Xử lý lỗi 401 - Token hết hạn
    if (isTokenExpired && !originalRequest._retry) {
      // Tránh refresh khi đang gọi API refresh-token
      if (originalRequest.url?.includes('/api/Auth/refresh-token')) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Nếu đang refresh, đợi kết quả
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        processQueue(error, null)
        localStorage.removeItem('access_token')
        window.location.href = '/'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${env.apiBaseUrl}/api/Auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        )

        const newAccessToken = response.data?.accessToken || response.data?.access_token
        if (newAccessToken) {
          localStorage.setItem('access_token', newAccessToken)
          if (response.data?.refreshToken) {
            localStorage.setItem('refresh_token', response.data.refreshToken)
          }

          // Cập nhật header cho request ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Process tất cả requests đang đợi trong queue
          processQueue(null, newAccessToken)

          // Retry request ban đầu
          return apiClient(originalRequest)
        } else {
          throw new Error('No access token in response')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý các lỗi khác (bao gồm 401 không phải token expired, hoặc đã retry rồi)
    const errors = error?.response?.data?.errors || null

    return Promise.reject({
      success: false,
      data: null,
      message: message || error?.message || 'Request error',
      errors,
      status,
      timestamp: new Date().toISOString()
    })
  }
)

/**
 * Helper function để tạo streaming request sử dụng config từ apiClient
 * Axios không hỗ trợ streaming response tốt trong browser, nên sử dụng fetch với config từ axios
 */
export async function createStreamingRequest(url: string, data: Record<string, any>): Promise<Response> {
  const token = localStorage.getItem('access_token')

  // Lấy baseURL và withCredentials từ Axios defaults (giữ nếu cần đồng bộ)
  const baseURL = apiClient.defaults.baseURL || ''
  const fullUrl = baseURL ? `${baseURL}${url}` : url

  // Headers: Chỉ set Content-Type + Authorization (không spread common để tránh trùng)
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers,
    credentials: apiClient.defaults.withCredentials ? 'include' : 'same-origin',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    let errorMessage = 'Request failed'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage)
  }

  return response
}
