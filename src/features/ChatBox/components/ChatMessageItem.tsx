import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, AlertCircle, BotIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '~/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import type { Message } from '../types/chatTypes'
import { useAuth } from '~/app/providers/AuthProvider'
import { FilePreview } from './FilePreview'

interface ChatMessageItemProps {
  message: Message
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [isThinkingOpen, setIsThinkingOpen] = useState(false)
  const thinkingContentRef = useRef<HTMLDivElement>(null)
  const isAI = message.isAI ?? false
  const { user } = useAuth()

  useEffect(() => {
    if (!isAI || !isThinkingOpen || !thinkingContentRef.current) return

    // Keep the latest streamed reasoning visible.
    const el = thinkingContentRef.current
    el.scrollTop = el.scrollHeight
  }, [message.thinking, isThinkingOpen, isAI])

  const getThinkingDuration = () => {
    if (typeof message.thinkingDuration === 'number' && message.thinkingDuration > 0) {
      return message.thinkingDuration
    }

    if (message.created_at && message.updated_at) {
      const created = new Date(message.created_at).getTime()
      const updated = new Date(message.updated_at).getTime()
      const delta = updated - created
      return delta > 0 ? delta : 0
    }

    return 0
  }

  const formatThinkingDuration = () => {
    const duration = getThinkingDuration()
    if (!duration) return ''
    if (duration < 1000) {
      return `${duration}ms`
    }
    return `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <div className={`flex gap-3 mb-6 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
          isAI ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}
      >
        {isAI ? <BotIcon className='w-4 h-4' /> : user?.name?.charAt(0).toUpperCase()}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 max-w-[calc(100vw-5rem)] min-w-0 flex flex-col ${isAI ? 'items-start pr-10' : 'items-end pl-10'}`}
      >
        {/* Thinking section */}
        {isAI && (
          <Collapsible open={isThinkingOpen} onOpenChange={setIsThinkingOpen} className='w-full mb-2 text-left'>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-auto px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50'
              >
                <ChevronDown className={`w-3 h-3 mr-1.5 transition-transform ${isThinkingOpen ? 'rotate-180' : ''}`} />
                <>Thought for {formatThinkingDuration()}</>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-2'>
              <div
                ref={thinkingContentRef}
                className='p-3 bg-muted/50 rounded-lg border border-border/50 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto text-left'
              >
                {message.thinking || <span className='text-muted-foreground/60'>No thinking available</span>}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Main message bubble */}
        <div
          className={`px-4 py-3 rounded-lg max-w-2xl text-left ${!isAI ? 'mt-6' : ''} ${
            isAI ? 'bg-muted text-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
          } ${message.status === 'ERROR' ? 'bg-destructive/25 border border-destructive' : ''}`}
        >
          {!isAI && message.files && message.files.length > 0 && <FilePreview files={message.files} />}
          <div className='text-sm leading-relaxed prose prose-sm max-w-none'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                  inline ? (
                    <code className='px-1 py-0.5 bg-muted rounded text-xs font-mono'>{children}</code>
                  ) : (
                    <pre className='p-3 bg-muted rounded-lg text-xs overflow-x-auto my-2'>
                      <code>{children}</code>
                    </pre>
                  ),
                ul: ({ children }) => <ul className='list-disc pl-4 mb-2 space-y-1'>{children}</ul>,
                ol: ({ children }) => <ol className='list-decimal pl-4 mb-2 space-y-1'>{children}</ol>,
                h1: ({ children }) => <h1 className='text-base font-bold mb-2'>{children}</h1>,
                h2: ({ children }) => <h2 className='text-sm font-bold mb-1'>{children}</h2>,
                h3: ({ children }) => <h3 className='text-sm font-semibold mb-1'>{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className='border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground my-2'>
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary underline hover:opacity-80'
                  >
                    {children}
                  </a>
                )
              }}
            >
              {message.message}
            </ReactMarkdown>
          </div>
        </div>

        {/* Status indicator */}
        {message.status === 'IN_PROGRESS' && (
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground px-1 mt-2'>
            <Loader2 className='w-3 h-3 animate-spin' />
            <span>Typing...</span>
          </div>
        )}

        {message.status === 'ERROR' && (
          <div className='flex items-center gap-1.5 text-xs text-destructive px-1 mt-2'>
            <AlertCircle className='w-3 h-3' />
            <span>Failed to send</span>
          </div>
        )}
      </div>
    </div>
  )
}
