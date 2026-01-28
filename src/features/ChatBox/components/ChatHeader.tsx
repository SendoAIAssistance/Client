import { Lightbulb } from 'lucide-react'
import { CardHeader } from '~/components/ui/card'
import ModeToggle from '~/components/ui/mode-toggle'

export function ChatHeader() {
  return (
    <CardHeader className='bg-primary text-primary-foreground px-6 py-5 rounded-t-lg border-b-2 border-primary/20 rounded-lg '>
      <div className='flex items-center gap-3'>
        <div className='p-2.5 bg-primary-foreground/15 rounded-lg backdrop-blur-sm'>
          <Lightbulb className='h-6 w-6' />
        </div>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>AI Assistant</h1>
          <p className='text-sm opacity-90 font-medium'>Always here to help you</p>
        </div>
        <div className='ml-auto'>
          <ModeToggle />
        </div>
      </div>
    </CardHeader>
  )
}
