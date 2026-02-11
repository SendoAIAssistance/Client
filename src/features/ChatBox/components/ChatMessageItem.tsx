import { useState } from 'react'
import { ChevronDown, Loader2, AlertCircle, BotIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import type { Message } from '../types/chatTypes'
import { fetchThinkingStream } from '~/lib/apiClient'
import { useAuth } from '~/app/providers/AuthProvider'
import { FilePreview } from './FilePreview'

interface ChatMessageItemProps {
  message: Message
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [thinking, setThinking] = useState(message.thinking || '')
  const [isThinkingOpen, setIsThinkingOpen] = useState(false)
  const [isLoadingThinking, setIsLoadingThinking] = useState(false)
  const [thinkingError, setThinkingError] = useState<string | null>(null)
  const isAI = message.isAI ?? false
  const { user } = useAuth()

  const handleLoadThinking = async () => {
    if (thinking || isLoadingThinking) return

    setIsLoadingThinking(true)
    setThinkingError(null)

    try {
      let thinkingText = ''

      await fetchThinkingStream(
        message._id || '',
        (chunk: string) => {
          thinkingText += chunk
          setThinking(thinkingText)
        },
        () => {
          setIsLoadingThinking(false)
        }
      )
    } catch (err: any) {
      setThinkingError(err.message || 'Failed to load thinking')
      setIsLoadingThinking(false)
    }
  }

  const formatThinkingDuration = () => {
    if (!message.thinkingDuration) return ''
    if (message.thinkingDuration < 1000) {
      return `${message.thinkingDuration}ms`
    }
    return `${(message.thinkingDuration / 1000).toFixed(1)}s`
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
                onClick={!thinking && !isLoadingThinking ? handleLoadThinking : undefined}
              >
                <ChevronDown className={`w-3 h-3 mr-1.5 transition-transform ${isThinkingOpen ? 'rotate-180' : ''}`} />
                {isLoadingThinking ? (
                  <>
                    <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                    Getting thought...
                  </>
                ) : (
                  <>Thought for {formatThinkingDuration()}</>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-2'>
              {thinkingError ? (
                <div className='flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-left'>
                  <AlertCircle className='w-4 h-4 text-destructive shrink-0 mt-0.5' />
                  <p className='text-xs text-destructive'>{thinkingError}</p>
                </div>
              ) : (
                <div className='p-3 bg-muted/50 rounded-lg border border-border/50 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto text-left'>
                  {thinking || (
                    <span className='text-muted-foreground/60'>
                      {isLoadingThinking ? 'Loading...' : 'No thinking available'}
                    </span>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Main message bubble */}
        <div
          className={`px-4 py-3 rounded-lg max-w-2xl text-left ${
            isAI ? 'bg-muted text-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
          }`}
        >
          {!isAI && message.files && message.files.length > 0 && <FilePreview files={message.files} />}
          <p className='text-sm leading-relaxed whitespace-pre-wrap wrap-break-words'>{message.message}</p>
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
