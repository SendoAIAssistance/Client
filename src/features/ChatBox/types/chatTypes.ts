export interface Message {
  _id?: string
  conversationId: string
  message: string // Message content (dùng isAI để phân biệt user hay AI)
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
