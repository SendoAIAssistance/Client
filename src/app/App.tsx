import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { ThemeProvider } from '~/contexts/theme-provider'
import { UserContext } from '~/contexts/UserContext'
import AuthProvider from './providers/AuthProvider'
import { routes } from './routes/routes'
import type { User } from './types/types'
import { Toaster } from '~/components/ui/sonner'

function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <AuthProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={routes} />
            <Toaster position='top-right' richColors />
          </Suspense>
        </UserContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
