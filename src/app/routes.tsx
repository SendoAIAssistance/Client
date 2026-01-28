import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '~/components/layouts'
import ChatBox from '~/features/ChatBox/ChatBox'
import Login from '~/features/Login/pages/Login'
import OAuthCallback from '~/features/Login/pages/OAuthCallback'
import TrainingBot from '~/features/TrainingAI/TrainingBot'

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/oauth2/callback',
    element: <OAuthCallback />
  },
  {
    path: '/home',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to='/home/chat-support' replace />
      },
      {
        path: 'chat-support',
        element: <ChatBox />
      },
      {
        path: 'training-ai',
        element: <TrainingBot />
      }
    ]
  }
])
