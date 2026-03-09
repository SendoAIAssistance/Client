import { Card, CardContent } from '~/components/ui/card'
import { useChat } from './hooks/useChat'
import { ChatHeader } from './components/ChatHeader'
import { ScrollArea } from '~/components/ui/scroll-area'
import { ChatMessages } from './components/ChatMessages'
import { ChatInput } from './components/ChatInput'

export default function ChatBox() {
  const { messages, inputValue, setInputValue, isLoading, sendMessage, scrollRef } = useChat()

  const handleSend = ({ message, files }: { message: string; files?: File[] }) => {
    return sendMessage(message, files)
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl min-w-[320px] mx-auto flex flex-col shadow-xl border-2 p-0 h-[calc(100vh-2rem)] max-h-200 overflow-hidden'>
        <ChatHeader />
        <CardContent className='flex-1 p-0 overflow-hidden bg-card min-h-0'>
          <ScrollArea className='h-full'>
            <div className='px-6 py-6'>
              <ChatMessages messages={messages} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} />
            </div>
          </ScrollArea>
        </CardContent>
        <ChatInput inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} isLoading={isLoading} />
      </Card>
    </div>
  )
}
