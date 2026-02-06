import { Paperclip, FileText, Image as ImageIcon, Film, Music } from 'lucide-react'

interface FilePreviewProps {
  files: File[]
}

export function FilePreview({ files }: FilePreviewProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className='h-5 w-5' />
    if (type.startsWith('video/')) return <Film className='h-5 w-5' />
    if (type.startsWith('audio/')) return <Music className='h-5 w-5' />
    if (type.includes('pdf') || type.includes('document')) return <FileText className='h-5 w-5' />
    return <Paperclip className='h-5 w-5' />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className='mt-3 flex flex-wrap gap-2 justify-end '>
      {files.map((file, fileIdx) => (
        <div
          key={fileIdx}
          className='border-2 rounded-lg overflow-hidden hover:bg-accent/50 transition-colors max-w-xs bg-muted/50'
        >
          {file.type.startsWith('image/') ? (
            <div className='flex flex-col'>
              <div className='relative w-full aspect-video bg-muted'>
                <img src={URL.createObjectURL(file)} alt={file.name} className='w-full h-full object-cover' />
              </div>
              <div className='p-2 flex items-center gap-2'>
                <ImageIcon className='h-5 w-5 text-accent-foreground shrink-0' />
                <div className='flex flex-col min-w-0 flex-1'>
                  <span className='text-s font-medium text-accent-foreground truncate'>{file.name}</span>
                  <span className='text-s text-accent-foreground'>{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-3 flex items-center gap-3'>
              <div className='h-12 w-12 bg-muted rounded-lg flex items-center justify-center shrink-0'>
                {getFileIcon(file.type)}
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='text-s font-medium text-accent-foreground truncate'>{file.name}</span>
                <span className='text-s text-accent-foreground'>{formatFileSize(file.size)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
