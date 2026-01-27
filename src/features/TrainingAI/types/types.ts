export interface TrainingDescriptionProps {
  description: string
  setDescription: (value: string) => void
}

export interface TrainingEntryProps {
  type: 'issue' | 'solution'
  content: string
  onChange: (value: string) => void
}
