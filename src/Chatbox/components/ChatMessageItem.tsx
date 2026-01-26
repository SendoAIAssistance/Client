import { Loader2, Lightbulb, User, CheckCheck, XCircle } from 'lucide-react'
import type { Message } from '../types/chatTypes'
import { formatTime } from '../utils/formatTime'
import { cn } from '~/lib/utils'

interface Props {
  message: Message
}

export function ChatMessageItem({ message }: Props) {
  const isAI = message.isAI

  if (!isAI) {
    // User message
    return (
      <div className='flex justify-end gap-3 animate-in fade-in slide-in-from-Lightbulb tom-2 duration-300'>
        <div className='flex flex-col items-end gap-1.5 max-w-full overflow-x-hidden'>
          <div className='bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 shadow-md border border-primary/30'>
            <p className='text-sm leading-relaxed font-medium wrap-break-words'>{message.userMessage}</p>
          </div>
          <div className='flex items-center gap-1.5 px-2'>
            <User className='h-3 w-3 text-muted-foreground' />
            <p className='text-xs text-muted-foreground font-medium'>{formatTime(message.created_at)}</p>
          </div>
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div className='flex justify-start gap-3 animate-in fade-in slide-in-from-Lightbulb tom-2 duration-300'>
      <div className='shrink-0 mt-1'>
        <div className='p-2 bg-accent/20 rounded-lg border border-accent/30'>
          <Lightbulb className='h-5 w-5 text-accent-foreground' />
        </div>
      </div>
      <div className='flex flex-col gap-1.5  max-w-full overflow-x-hidden'>
        <div
          className={cn(
            'rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border-2 transition-all wrap-break-words overflow-wrap-anywhere',
            message.status === 'ERROR'
              ? 'bg-destructive/15 text-destructive border-destructive/30'
              : 'bg-muted text-foreground border-muted/50'
          )}
        >
          {message.status === 'IN_PROGRESS' && !message.chatMessage ? (
            <div className='flex items-center gap-2.5 py-1'>
              <Loader2 className='h-4 w-4 animate-spin text-primary' />
              <span className='text-sm font-semibold text-muted-foreground'>Thinking...</span>
            </div>
          ) : (
            <p className='text-sm leading-relaxed whitespace-pre-wrap wrap-break-word'>
              {message.chatMessage || 'Sorry, something went wrong. Please try again.'}
            </p>
          )}
        </div>
        <div className='flex items-center gap-2 px-2'>
          {message.status === 'IN_PROGRESS' && message.chatMessage && (
            <>
              <Loader2 className='h-3 w-3 animate-spin text-primary' />
              <span className='text-xs text-primary font-bold'>typing...</span>
            </>
          )}
          {message.status === 'COMPLETED' && <CheckCheck className='h-3.5 w-3.5 text-accent' />}
          {message.status === 'ERROR' && <XCircle className='h-3.5 w-3.5 text-destructive' />}
          <p className='text-xs text-muted-foreground font-medium'>{formatTime(message.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}
