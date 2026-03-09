import { useCallback, useState } from 'react'
import { streamAIMessage } from '../services/streaming'

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

      try {
        let latestResponse = ''
        let latestThinking = ''

        const { fullResponse, fullThinking } = await streamAIMessage(endpoint, formData, {
          onThinking: (_, accumulatedThinking) => {
            latestThinking = accumulatedThinking
            options?.onThinkingUpdate?.(latestThinking)
            options?.onChunkReceived?.(latestResponse, latestThinking, 'thinking')
          },
          onMessage: (_, accumulatedResponse) => {
            latestResponse = accumulatedResponse
            options?.onChunkReceived?.(latestResponse, latestThinking, 'message')
          }
        })

        onDone(fullResponse, fullThinking)
        setIsStreaming(false)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Streaming failed')
        setError(error)
        options?.onError?.(error)
        setIsStreaming(false)
        throw error
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
