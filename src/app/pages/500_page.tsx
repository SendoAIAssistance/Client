import { ServerCrash, Home, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'

export default function ServerError() {
  const navigate = useNavigate()

  const handleBackward = () => {
    navigate(-1)
  }

  const handleBackToHome = () => {
    navigate('/home')
  }
  const handleReload = () => {
    window.location.reload()
  }
  return (
    <div className='flex min-h-screen items-center justify-center from-background via-background to-destructive/5 px-4 py-16'>
      <Card className='w-full max-w-md border-destructive/20 shadow-xl'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center text-center'>
            {/* Icon */}
            <div className='rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5'>
              <ServerCrash className='h-16 w-16 text-destructive' strokeWidth={1.5} />
            </div>

            {/* Error Code */}
            <div className='mt-8'>
              <h1 className='text-7xl font-bold tracking-tighter text-foreground'>500</h1>
            </div>

            {/* Title */}
            <h2 className='mt-4 text-2xl font-semibold tracking-tight text-foreground'>Lỗi máy chủ</h2>

            {/* Description */}
            <p className='mt-3 text-base text-muted-foreground'>
              Đã có lỗi xảy ra trên máy chủ. Chúng tôi đang khắc phục sự cố. Vui lòng thử lại sau ít phút.
            </p>

            {/* Status */}
            <div className='mt-4 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-destructive'></div>
              Đang xử lý sự cố
            </div>

            {/* Actions */}
            <div className='mt-8 flex w-full flex-col gap-3 contain-content'>
              <Button className='w-full hover:text-destructive hover:bg-accent' size='lg' onClick={handleReload}>
                <RefreshCw className='mr-2 h-4 w-4' />
                Thử lại
              </Button>
              <div className='flex gap-2'>
                <Button variant='outline' className='flex-1 hover:text-destructive' onClick={handleBackward}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại
                </Button>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' className='flex-1 hover:text-destructive' onClick={handleBackToHome}>
                  <Home className='mr-2 h-4 w-4' />
                  Trang chủ
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className='mt-6 space-y-1'>
              <p className='text-xs text-muted-foreground'>
                Thời gian: <span className='font-mono'>{new Date().toLocaleString('vi-VN')}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
