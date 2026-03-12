export type StreamMessageType = 'chunk' | 'thinking'

export interface StreamEventPayload {
  type?: StreamMessageType | string
  content?: string
  status?: string
  [key: string]: unknown
}

export interface ReadStreamOptions {
  streamType?: StreamMessageType | 'all'
}

export interface StreamOptions {
  signal?: AbortSignal
}

export interface StreamChunkHandler {
  onChunk?: (chunk: string, event?: StreamEventPayload) => void
  onThinking?: (chunk: string, fullThinking: string) => void
  onMessage?: (chunk: string, fullResponse: string) => void
}
