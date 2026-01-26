export interface Message {
  _id?: string
  conversationId: string
  userMessage: string
  chatMessage?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR' | 'CANCEL'
  created_at?: Date
  updated_at?: Date
  isAI?: boolean
}

export type MessageStatus = Message['status']
