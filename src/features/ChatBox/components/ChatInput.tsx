import { Loader2, Send, Paperclip, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useState } from 'react'
import Modal from './Modal'

interface Props {
  inputValue: string
  setInputValue: (value: string) => void
  onSend: (params: { message: string; files?: File[] }) => void
  isLoading: boolean
}

export function ChatInput({ inputValue, setInputValue, onSend, isLoading }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    onSend({ message: inputValue, files: selectedFiles.length > 0 ? selectedFiles : undefined })
    setSelectedFiles([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      <div className='border-t-2 bg-muted/30 p-4 rounded-b-lg'>
        {selectedFiles.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-2'>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className='relative group border-2 rounded-lg p-2 bg-background hover:bg-accent transition-colors'
              >
                {getFilePreview(file) ? (
                  <div className='flex items-center gap-2'>
                    <img src={getFilePreview(file)!} alt={file.name} className='h-16 w-16 object-cover rounded' />
                    <div className='flex flex-col' onClick={() => setIsDialogOpen(true)}>
                      <span className='text-sm font-medium truncate max-w-37.5'>{file.name}</span>
                      <span className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center gap-2 px-2'>
                    <div className='h-16 w-16 bg-muted rounded flex items-center justify-center'>
                      <Paperclip className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <div className='flex flex-col' onClick={() => setIsDialogOpen(true)}>
                      <span className='text-sm font-medium truncate max-w-37.5'>{file.name}</span>
                      <span className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                )}
                <Button
                  variant='destructive'
                  size='icon'
                  className='absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => removeFile(index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className='flex gap-3'>
          <Button
            variant='outline'
            size='icon'
            className='h-12 w-12 border-2'
            onClick={() => setIsDialogOpen(true)}
            disabled={isLoading}
          >
            <Paperclip className='h-5 w-5' />
          </Button>
          <Input
            type='text'
            placeholder='Type your message...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className='flex-1 h-12 bg-background border-2 focus-visible:ring-2 focus-visible:ring-ring font-medium'
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
            size='icon'
            className='h-12 w-12 shadow-md'
          >
            {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : <Send className='h-5 w-5' />}
          </Button>
        </div>
        <p className='text-xs text-muted-foreground text-center mt-3 font-medium'>
          AI can make mistakes. Check important info.
        </p>
      </div>

      <Modal
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleFileSelect={handleFileSelect}
        removeFile={removeFile}
        getFilePreview={getFilePreview}
        formatFileSize={formatFileSize}
      />
    </>
  )
}
