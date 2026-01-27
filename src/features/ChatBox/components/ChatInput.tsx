import { Loader2, Send } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

interface Props {
  inputValue: string
  setInputValue: (value: string) => void
  onSend: () => void
  isLoading: boolean
}

export function ChatInput({ inputValue, setInputValue, onSend, isLoading }: Props) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className='border-t-2 bg-muted/30 p-4 rounded-b-lg'>
      <div className='flex gap-3'>
        <Input
          type='text'
          placeholder='Type your message...'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className='flex-1 h-12 bg-background border-2 focus-visible:ring-2 focus-visible:ring-ring font-medium'
        />
        <Button onClick={onSend} disabled={isLoading || !inputValue.trim()} size='icon' className='h-12 w-12 shadow-md'>
          {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : <Send className='h-5 w-5' />}
        </Button>
      </div>
      <p className='text-xs text-muted-foreground text-center mt-3 font-medium'>
        AI can make mistakes. Check important info.
      </p>
    </div>
  )
}
