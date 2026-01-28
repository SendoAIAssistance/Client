import './App.css'
import { RouterProvider } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { UserContext, type User } from './contexts/UserContext'
import { ThemeProvider } from './contexts/theme-provider'
import { routes } from './routes'

function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <UserContext.Provider value={{ user, setUser }}>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={routes} />
        </Suspense>
      </UserContext.Provider>
    </ThemeProvider>
  )
}

export default App
