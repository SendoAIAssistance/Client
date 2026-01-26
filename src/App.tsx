import './App.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { useState } from 'react'
import { UserContext, type User } from './contexts/UserContext'

function App() {
  const [user, setUser] = useState<User | null>(null)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  )
}

export default App
