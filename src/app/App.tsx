import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { ThemeProvider } from '~/contexts/theme-provider'
import { UserContext, type User } from '~/contexts/UserContext'
import AuthProvider from './providers/AuthProvider'
import { routes } from './routes'

function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <AuthProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={routes} />
          </Suspense>
        </UserContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
