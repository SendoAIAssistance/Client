import { useEffect, useState } from 'react'
import { useUser } from '~/contexts/UserContext'
import { useSearchParams, useNavigate } from 'react-router'
import { apiClient } from '~/lib/apiClient'
import type { User } from '~/app/types/types'
import { endPoints } from '~/lib/endPoints'
import { toastUtils } from '~/app/utils/ToastAndNavigate'

const mockUser: User = {
  id: '1',
  name: 'Nguyen Van A',
  email: 'kenn0679@gmail.com'
}

//oauth2/callback?access_token=xyz&refresh_token=abc
export default function OAuthCallback() {
  const { user, setUser } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (user) {
          toastUtils.success(navigate, "You're already logged in.", '/home')
        }

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          toastUtils.error(navigate, 'Xác thực thất bại: Thiếu token', '/')
          setIsLoading(false)
          return
        }

        // Lưu tokens
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)

        // const response = await apiClient.get<User>(endPoints.auth.me)

        // if (response.data) {
        //   setUser(response.data)
        //   navigate('/home')
        // } else {
        //   toastUtils.error(navigate, 'Không thể lấy thông tin người dùng', '/')
        // }
        setUser(mockUser)
        toastUtils.success(navigate, 'Xác thực thành công!', '/home')
      } catch (err) {
        toastUtils.error(navigate, 'Không thể lấy thông tin người dùng', '/')
        console.error('Error fetching user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    handleAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 flex flex-col items-center justify-center min-h-screen'>
        <div>Đang xác thực...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='container mx-auto px-4 flex flex-col items-center justify-center min-h-screen'>
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 flex flex-col items-center justify-center min-h-screen'>
      <h2 className='mb-2'>Xin chào, {user.name || user.email}</h2>
      <p>Email: {user.email}</p>
    </div>
  )
}
