import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import { ThemeProvider } from '~/app/providers/theme-provider'
import AuthProvider from './providers/AuthProvider'
import { routes } from './routes/routes'
import { Toaster } from '~/components/ui/sonner'

function App() {
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={routes} />
          <Toaster position='top-right' richColors duration={2000} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
