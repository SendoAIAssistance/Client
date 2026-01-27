import './App.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { useState } from 'react'
import { UserContext, type User } from './contexts/UserContext'
import { ThemeProvider } from './DarkMode/theme-provider'

function App() {
  const [user, setUser] = useState<User | null>(null)
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <UserContext.Provider value={{ user, setUser }}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </ThemeProvider>
  )
}

export default App
