import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'

export default function NotFound() {
  const navigate = useNavigate()

  const handleBackward = () => {
    navigate(-1)
  }
  return (
    <div className='flex min-h-screen items-center justify-center from-background via-background to-muted/20 px-4 py-16'>
      <Card className='w-full max-w-md border-muted shadow-xl'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center text-center'>
            {/* Icon */}
            <div className='rounded-full bg-muted p-6 ring-8 ring-muted/50'>
              <FileQuestion className='h-16 w-16 text-muted-foreground' strokeWidth={1.5} />
            </div>

            {/* Error Code */}
            <div className='mt-8'>
              <h1 className='text-7xl font-bold tracking-tighter text-foreground'>404</h1>
            </div>

            {/* Title */}
            <h2 className='mt-4 text-2xl font-semibold tracking-tight text-foreground'>Không tìm thấy trang</h2>

            {/* Description */}
            <p className='mt-3 text-base text-muted-foreground'>
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn.
            </p>

            {/* Actions */}
            <div className='mt-8 flex w-full flex-col gap-3'>
              <Button
                className='w-full hover:text-destructive hover:bg-accent'
                size='lg'
                onClick={() => navigate('/home')}
              >
                <Home className='mr-2 h-4 w-4' />
                Về trang chủ
              </Button>
              <div className='flex gap-3'>
                <Button variant='outline' className='flex-1 hover:text-destructive' onClick={handleBackward}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <p className='mt-6 text-xs text-muted-foreground'>
              Mã lỗi: <span className='font-mono'>ERR_NOT_FOUND_404</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
