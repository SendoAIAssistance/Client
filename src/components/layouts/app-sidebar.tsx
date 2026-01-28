import { MessageSquare, Brain, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { apiClient } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import { useAuth } from '~/app/providers/AuthProvider'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiClient.post(endPoints.auth.logout())
    } catch {
      // ignore error; proceed to clear local state
    } finally {
      logout()
      navigate('/')
    }
  }

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
      <SidebarFooter className='border-t px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium'>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-medium text-foreground truncate'>
                {user?.name || user?.email || 'User'}
              </span>
              <span className='text-xs text-muted-foreground truncate'>{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors'
            title='Logout'
          >
            <LogOut className='h-4 w-4' />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
