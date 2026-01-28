import './App.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { useState } from 'react'
import { UserContext, type User } from './contexts/UserContext'
import { ThemeProvider } from './DarkMode/theme-provider'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'

function App() {
  const [user, setUser] = useState<User | null>(null)
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <SidebarProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <RouterProvider router={router} />
          <SidebarTrigger />
        </UserContext.Provider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
