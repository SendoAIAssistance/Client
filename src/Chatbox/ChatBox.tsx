import { Card, CardContent } from '~/components/ui/card'
import { useChat } from './hooks/useChat'
import { ChatHeader } from './components/ChatHeader'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { ChatMessages } from './components/ChatMessages'
import { ChatInput } from './components/ChatInput'

export default function ChatBox() {
  const { messages, inputValue, setInputValue, isLoading, sendMessage, scrollRef } = useChat()

  const handleSend = () => {
    sendMessage(inputValue)
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-4xl h-700px flex flex-col shadow-xl border-2 p-0'>
        <ChatHeader />
        <CardContent className='flex-1 p-0 overflow-hidden bg-card'>
          <ScrollArea className='h-full px-6 py-6'>
            <ChatMessages messages={messages} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} />
          </ScrollArea>
        </CardContent>
        <ChatInput inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} isLoading={isLoading} />
      </Card>
    </div>
  )
}
