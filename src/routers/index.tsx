import { createBrowserRouter } from 'react-router-dom'
import Login from '~/Login/pages/Login'
import OAuthCallback from '~/Login/pages/OAuthCallback'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/oauth2/callback',
    element: <OAuthCallback />
  }
])
