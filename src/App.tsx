import './App.css'
import { RouterProvider } from 'react-router-dom'
import { useState } from 'react'
import { UserContext, type User } from './contexts/UserContext'
import { ThemeProvider } from './contexts/theme-provider'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { routes } from './routes'

function App() {
  const [user, setUser] = useState<User | null>(null)
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <SidebarProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <RouterProvider router={routes} />
          <SidebarTrigger />
        </UserContext.Provider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
