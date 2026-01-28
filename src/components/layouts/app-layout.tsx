import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import ModeToggle from '../ui/mode-toggle'

export function AppLayout() {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <header className='bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b px-4 py-2 sm:px-6'>
            <SidebarTrigger className='[&_svg]:size-5!' />
            <div className='ml-auto'>
              <ModeToggle />
            </div>
          </header>
          <main className='size-full flex-1 px-4 py-6 sm:px-6'>
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
