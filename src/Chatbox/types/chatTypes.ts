export interface Message {
  _id?: string
  conversationId: string
  message: string // Message content (dùng isAI để phân biệt user hay AI)
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR' | 'CANCEL'
  created_at?: Date
  updated_at?: Date
  isAI?: boolean
}

export type MessageStatus = Message['status']
