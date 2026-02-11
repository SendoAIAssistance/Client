import { Lightbulb } from 'lucide-react'
import type { Message } from '../types/chatTypes'
import { ChatMessageItem } from './ChatMessageItem'

interface ChatMessageProps {
  messages: Message[]
  scrollRef: React.RefObject<HTMLDivElement>
}
export function ChatMessages({ messages, scrollRef }: ChatMessageProps) {
  if (messages.length === 0) {
    return (
      <div className='h-full flex items-center justify-center text-center py-20'>
        <div className='max-w-md space-y-4'>
          <div className='inline-flex p-5 bg-muted rounded-2xl shadow-sm'>
            <Lightbulb className='h-14 w-14 text-primary' />
          </div>
          <div>
            <p className='text-xl font-bold text-foreground mb-2'>Start a conversation</p>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Send a message to begin chatting with your AI assistant
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 overflow-x-hidden max-w-full'>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <ChatMessageItem message={msg} />
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  )
}
