import { Paperclip, X } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'

interface ModalProps {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  selectedFiles: File[]
  setSelectedFiles: (files: File[]) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  handleDrop: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: () => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
  getFilePreview: (file: File) => string | null
  formatFileSize: (size: number) => string
}

export default function Modal({
  isDialogOpen,
  setIsDialogOpen,
  selectedFiles,
  isDragging,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileSelect,
  removeFile,
  getFilePreview,
  formatFileSize
}: ModalProps) {
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className='flex flex-col items-center justify-center gap-4'>
              <div className='p-4 rounded-full bg-muted'>
                <Paperclip className='h-8 w-8 text-muted-foreground' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium mb-1'>Drop files here or click to browse</p>
                <p className='text-xs text-muted-foreground'>Support for images, documents, and more</p>
              </div>
              <Input id='file-upload' type='file' multiple onChange={handleFileSelect} className='hidden' />
              <Button
                variant='outline'
                onClick={() => document.getElementById('file-upload')?.click()}
                className='w-full'
              >
                Browse Files
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className='mt-4'>
              <p className='text-sm font-medium mb-2'>{selectedFiles.length} file(s) selected</p>
              <div className='max-h-50 overflow-y-auto space-y-2'>
                {selectedFiles.map((file, index) => (
                  <div key={index} className='flex items-center justify-between p-2 border rounded-lg bg-muted/50'>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      {getFilePreview(file) ? (
                        <img src={getFilePreview(file)!} alt={file.name} className='h-10 w-10 object-cover rounded' />
                      ) : (
                        <div className='h-10 w-10 bg-background rounded flex items-center justify-center'>
                          <Paperclip className='h-4 w-4 text-muted-foreground' />
                        </div>
                      )}
                      <div className='flex flex-col min-w-0 flex-1'>
                        <span className='text-sm font-medium truncate'>{file.name}</span>
                        <span className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0' onClick={() => removeFile(index)}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-2 mt-4'>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false)
              }}
              className='flex-1'
              disabled={selectedFiles.length === 0}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
