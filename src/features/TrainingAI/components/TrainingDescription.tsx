import React from 'react'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import type { TrainingDescriptionProps } from '../types/types'

export default function TrainingDescription({ description, setDescription }: TrainingDescriptionProps) {
  const MAX_LENGTH = 1000

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  return (
    <Field className='w-full  space-y-2'>
      <div className={'flex items-center justify-between'}>
        <FieldLabel htmlFor='description' className='text-primary text-xl'>
          Description
        </FieldLabel>
        <span className='text-xs text-muted-foreground'>
          {description.length} / {MAX_LENGTH}
        </span>
      </div>
      <Input
        className='bg-background'
        id='description'
        maxLength={MAX_LENGTH}
        onChange={handleChange}
        placeholder='Provide a brief description of the training.'
        value={description}
      />
    </Field>
  )
}
