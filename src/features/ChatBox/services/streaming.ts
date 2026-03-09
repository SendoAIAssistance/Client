import { toast } from 'sonner'
import { env } from '~/lib/env'

export type StreamMessageType = 'chunk' | 'thinking'

export interface StreamEventPayload {
  type?: StreamMessageType | string
  content?: string
  status?: string
  [key: string]: unknown
}

interface ReadStreamOptions {
  streamType?: StreamMessageType | 'all'
}

interface StreamOptions {
  signal?: AbortSignal
}

interface StreamChunkHandler {
  onChunk?: (chunk: string, event?: StreamEventPayload) => void
  onThinking?: (chunk: string, fullThinking: string) => void
  onMessage?: (chunk: string, fullResponse: string) => void
}

const parseSseDataLine = (line: string): StreamEventPayload | null => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return null

  const raw = trimmed.slice(5).trim()
  if (!raw || raw === '[DONE]') return null

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as StreamEventPayload
    }
  } catch {
    return {
      type: 'chunk',
      content: raw,
      status: 'IN_PROGRESS'
    }
  }

  return null
}

const normalizeStreamEventType = (eventType: string): string => {
  const type = eventType.toLowerCase()
  if (type === 'text') return 'chunk'
  if (type === 'reasoning') return 'thinking'
  return type
}

const shouldEmitStreamEvent = (eventType: string, targetType: StreamMessageType | 'all' = 'all'): boolean => {
  if (targetType === 'all') return true
  return normalizeStreamEventType(eventType) === targetType
}

export async function createStreamingRequest(
  url: string,
  data: Record<string, unknown> | FormData,
  options?: { signal?: AbortSignal; onError?: (err: Error) => void }
): Promise<Response> {
  const token = localStorage.getItem('access_token')
  const fullUrl = `${env.apiBaseUrl}${url.startsWith('/') ? url : '/' + url}`

  const isFormData = data instanceof FormData
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  }

  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: isFormData ? data : JSON.stringify(data),
      signal: options?.signal
    })

    if (!res.ok) {
      let msg = 'Request failed'
      try {
        const errData = await res.json()
        msg = errData.message || msg
      } catch {
        // Ignore JSON parse errors.
      }

      const err = new Error(msg)

      if (res.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setTimeout(() => (window.location.href = '/'), 300)
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

export async function readStream(
  response: Response,
  onChunk: (text: string, event?: StreamEventPayload) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void,
  options?: ReadStreamOptions
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body not readable')

  const decoder = new TextDecoder()
  let buffer = ''

  const targetType = options?.streamType ?? 'all'

  const processBuffer = (flush = false) => {
    const lines = buffer.split(/\r?\n/)
    if (!flush) {
      buffer = lines.pop() || ''
    } else {
      buffer = ''
    }

    for (const line of lines) {
      const payload = parseSseDataLine(line)
      if (!payload) continue

      const eventType = normalizeStreamEventType(String(payload.type || ''))
      const eventStatus = String(payload.status || '').toUpperCase()

      if (eventStatus === 'COMPLETED' || eventType === 'done') continue

      if (!eventType || !shouldEmitStreamEvent(eventType, targetType)) continue

      const content = typeof payload.content === 'string' ? payload.content : ''
      if (!content || content.toUpperCase() === 'END') continue

      onChunk(content, payload)
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        processBuffer(true)
        onComplete?.()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      processBuffer()
    }
  } catch (err: any) {
    onError?.(err)
    throw err
  } finally {
    reader.releaseLock()
  }
}

export async function streamAIMessage(
  endpoint: string,
  formData: FormData,
  handlers: StreamChunkHandler,
  options?: StreamOptions
): Promise<{ fullResponse: string; fullThinking: string }> {
  const response = await createStreamingRequest(endpoint, formData, { signal: options?.signal })

  let fullResponse = ''
  let fullThinking = ''

  await readStream(
    response,
    (chunk, event) => {
      const eventType = normalizeStreamEventType(String(event?.type || ''))

      if (eventType === 'thinking') {
        fullThinking += chunk
        handlers.onThinking?.(chunk, fullThinking)
        handlers.onChunk?.(chunk, event)
        return
      }

      fullResponse += chunk
      handlers.onMessage?.(chunk, fullResponse)
      handlers.onChunk?.(chunk, event)
    },
    undefined,
    undefined,
    { streamType: 'all' }
  )

  return { fullResponse, fullThinking }
}
