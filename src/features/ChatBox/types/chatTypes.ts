export interface Message {
  _id?: string
  conversationId: string
  message: string // Message content (use isAI to distinguish between user and AI)
  files?: File[] // Attached files
  status: MessageStatus
  created_at?: Date
  updated_at?: Date
  isAI?: boolean
}

export const MessageStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'COMPLETED',
  ERROR: 'ERROR'
} as const

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]
