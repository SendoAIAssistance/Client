import React from 'react'
import type { TrainingEntryProps } from '../types/types'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { Textarea } from '~/components/ui/textarea'

export default function TrainingEntry({ type, content, onChange }: TrainingEntryProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }
  return (
    <Field className='w-full space-y-2' data-invalid={type === 'issue'}>
      <FieldLabel htmlFor='reason' className={`text-primary text-xl ${type === 'issue' ? 'text-red-600' : ''}`}>
        {type === 'issue' ? 'Issue' : 'Solution'}
      </FieldLabel>

      <Textarea
        value={content}
        onChange={handleChange}
        placeholder={type === 'issue' ? 'Issue...' : 'Solution...'}
        rows={type === 'issue' ? 5 : 15}
        aria-invalid={type === 'issue'}
        className={`resize-y bg-primary-foreground ${type === 'issue' ? 'min-h-15' : 'min-h-30'}`}
      />

      <FieldDescription className='text-muted-foreground text-sm flex justify-start'>
        {type === 'issue' ? 'Briefly describe the issue.' : 'Show how to resolve the issue to help the AI improve.'}
      </FieldDescription>
    </Field>
  )
}
