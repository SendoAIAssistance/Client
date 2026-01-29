import { toast } from 'sonner'
import type { NavigateFunction } from 'react-router'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastAndNavigateOptions {
  type: ToastType
  message: string
  navigateTo?: string
  delay?: number // milliseconds, default 1500
}

/**
 * Hiển thị toast message và tùy chọn navigate sau đó
 * @param navigate - React Router navigate function
 * @param options - { type, message, navigateTo?, delay? }
 */
export function toastAndNavigate(navigate: NavigateFunction, options: ToastAndNavigateOptions) {
  const { type, message, navigateTo, delay = 1500 } = options

  // Hiển thị toast
  toast[type](message)

  // Navigate nếu có path
  if (navigateTo) {
    setTimeout(() => {
      navigate(navigateTo)
    }, delay)
  }
}

/**
 * Shortcut cho các toast type phổ biến
 */
export const toastUtils = {
  success: (navigate: NavigateFunction, message: string, navigateTo?: string) =>
    toastAndNavigate(navigate, { type: 'success', message, navigateTo }),

  error: (navigate: NavigateFunction, message: string, navigateTo?: string) =>
    toastAndNavigate(navigate, { type: 'error', message, navigateTo }),

  warning: (navigate: NavigateFunction, message: string, navigateTo?: string) =>
    toastAndNavigate(navigate, { type: 'warning', message, navigateTo }),

  info: (navigate: NavigateFunction, message: string, navigateTo?: string) =>
    toastAndNavigate(navigate, { type: 'info', message, navigateTo })
}
