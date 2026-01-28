import { MessageSquare, Brain } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const menuItems = [
  {
    title: 'Chat Support',
    url: '/home/chat-support',
    icon: MessageSquare
  },
  {
    title: 'Training AI',
    url: '/home/training-ai',
    icon: Brain
  }
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className='border-b px-6 py-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Brain className='h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold'>AI Assistant</span>
            <span className='text-xs text-muted-foreground'>Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className='gap-3 px-4 py-2.5 transition-all hover:bg-accent text-lg text-primary hover:text-primary-foreground'
                  >
                    <Link to={item.url}>
                      <item.icon className='h-5 w-5' />
                      <span className='font-medium'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
