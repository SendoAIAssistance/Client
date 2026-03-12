import { useCallback, useState } from 'react'
import { streamAIMessage } from '../services/streaming'

const STREAM_TIMEOUT_MS = 60_000
const STREAM_TIMEOUT_ERROR_MESSAGE = 'AI response timed out after 60 seconds.'

interface UseStreamingOptions {
  onChunkReceived?: (response: string, thinking: string, eventType: 'message' | 'thinking') => void
  onThinkingUpdate?: (thinking: string) => void
  onError?: (error: Error) => void
}

export function useStreaming(options?: UseStreamingOptions) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const stream = useCallback(
    async (endpoint: string, formData: FormData, onDone: (response: string, thinking: string) => void) => {
      setIsStreaming(true)
      setError(null)

      const abortController = new AbortController()
      let hasReceivedFirstChunk = false
      const timeoutId = window.setTimeout(() => {
        if (!hasReceivedFirstChunk) {
          abortController.abort(STREAM_TIMEOUT_ERROR_MESSAGE)
        }
      }, STREAM_TIMEOUT_MS)

      const markFirstChunkReceived = () => {
        if (!hasReceivedFirstChunk) {
          hasReceivedFirstChunk = true
          window.clearTimeout(timeoutId)
        }
      }

      try {
        let latestResponse = ''
        let latestThinking = ''

        const { fullResponse, fullThinking } = await streamAIMessage(
          endpoint,
          formData,
          {
            onThinking: (_, accumulatedThinking) => {
              markFirstChunkReceived()
              latestThinking = accumulatedThinking
              options?.onThinkingUpdate?.(latestThinking)
              options?.onChunkReceived?.(latestResponse, latestThinking, 'thinking')
            },
            onMessage: (_, accumulatedResponse) => {
              markFirstChunkReceived()
              latestResponse = accumulatedResponse
              options?.onChunkReceived?.(latestResponse, latestThinking, 'message')
            }
          },
          { signal: abortController.signal }
        )

        onDone(fullResponse, fullThinking)
        setIsStreaming(false)
      } catch (err) {
        const error =
          err instanceof DOMException && err.name === 'AbortError'
            ? new Error(STREAM_TIMEOUT_ERROR_MESSAGE)
            : err instanceof Error
              ? err
              : new Error('có lỗi xảy ra khi nhận phản hồi từ AI.')
        setError(error)
        options?.onError?.(error)
        setIsStreaming(false)
        throw error
      } finally {
        window.clearTimeout(timeoutId)
      }
    },
    [options]
  )

  return {
    stream,
    isStreaming,
    error,
    setError
  }
}
