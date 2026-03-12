import { env } from '~/lib/env'
import { Button } from '~/components/ui/button'
import { useEffect } from 'react'
import { useAuth } from '~/app/providers/AuthProvider'
import { useNavigate } from 'react-router'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: env.googleAuthorizedRedirectUri,
    client_id: env.googleClientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    )
  }
  const qs = new URLSearchParams(options).toString()
  const authorizationUrl = `${rootUrl}?${qs}`

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true })
    }
  }, [loading, user, navigate])

  const handleLogin = () => {
    window.location.href = authorizationUrl
  }

  return (
    <div className={'container mx-auto px-4 flex items-center justify-center min-h-screen'}>
      <div className='flex flex-col items-center'>
        <img src='https://portal.sendo.vn/images/bannner_users.png' alt='Sendo_banner' className='mb-2' />
        <p className='m-2'>Cổng đăng nhập OpenID</p>
        <Button type='button' variant={'default'} className='btn-primary m-2' onClick={handleLogin}>
          Đăng nhập với Google
        </Button>
      </div>
    </div>
  )
}
