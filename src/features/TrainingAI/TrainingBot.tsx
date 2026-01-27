import { useState } from 'react'
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '~/components/ui/field'
import TrainingDescription from './components/TrainingDescription'
import TrainingEntry from './components/TrainingEntry'

export default function TrainingBot() {
  const [description, setDescription] = useState('')
  const [issues, setIssues] = useState('')
  const [solutions, setSolutions] = useState('')

  const handleIssueChange = (value: string) => {
    setIssues(value)
  }
  return (
    <div className='container mx-auto min-h-screen'>
      <form>
        <FieldSet>
          <FieldLegend className='text-primary font-bold text-4xl!'>TRAINING AI SECTION</FieldLegend>
          <FieldDescription className='text-muted-foreground'>
            Describe the purpose and functionality of the training AI section here.
          </FieldDescription>
          <FieldGroup>
            <TrainingDescription description={description} setDescription={setDescription} />
            <TrainingEntry type='issue' content={issues} onChange={handleIssueChange} />
            <TrainingEntry type='solution' content={solutions} onChange={setSolutions} />
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
