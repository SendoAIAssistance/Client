import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '~/contexts/UserContext'

export default function OAuthCallback() {
  const { user, setUser } = useUser()
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) return
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      setTimeout(() => setError('Không tìm thấy mã code xác thực!'), 0)
      return
    }

    axios
      .post('/api/oauth/google', { code })
      .then((res) => {
        const { access_token } = res.data
        return axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        })
      })
      .then((res) => {
        setUser(res.data)
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err) => {
        setTimeout(() => setError('Lỗi xác thực hoặc lấy thông tin user!'), 0)
      })
  }, [setUser, user])

  if (error) return <div className='text-red-500'>{error}</div>
  if (!user) return <div>Đang xác thực...</div>
  return (
    <div className='container mx-auto px-4 flex flex-col items-center justify-center min-h-screen'>
      <h2 className='mb-2'>Xin chào, {user.name || user.email}</h2>
      <img src={user.picture} alt='avatar' className='rounded-full w-16 h-16' />
      <p>Email: {user.email}</p>
    </div>
  )
}
