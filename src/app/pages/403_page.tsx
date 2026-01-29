// app/403/page.tsx
import { ShieldX, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'

export default function Forbidden() {
  const navigate = useNavigate()

  const handleBackward = () => navigate(-1)

  const handleBackToHome = () => navigate('/home')
  return (
    <div className='flex min-h-screen items-center justify-center from-background via-background to-muted/20 px-4 py-16'>
      <Card className='w-full max-w-md border-destructive/20 shadow-xl'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center text-center'>
            {/* Icon */}
            <div className='rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5'>
              <ShieldX className='h-16 w-16 text-destructive' strokeWidth={1.5} />
            </div>

            {/* Error Code */}
            <div className='mt-8'>
              <h1 className='text-7xl font-bold tracking-tighter text-foreground'>403</h1>
            </div>

            {/* Title */}
            <h2 className='mt-4 text-2xl font-semibold tracking-tight text-foreground'>Truy cập bị từ chối</h2>

            {/* Description */}
            <p className='mt-3 text-base text-muted-foreground'>
              Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
            </p>

            {/* Actions */}
            <div className='mt-8 flex w-full flex-col gap-3 contain-content'>
              <Button className='w-full hover:text-destructive hover:bg-accent' onClick={handleBackToHome}>
                <Home className='mr-2 h-4 w-4' />
                Về trang chủ
              </Button>
              <Button variant='outline' className='w-full hover:text-destructive' onClick={handleBackward}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
