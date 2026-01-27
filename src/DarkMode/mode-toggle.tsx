import { useId, useState, useEffect } from 'react'

import { MoonIcon, SunIcon } from 'lucide-react'

import { Switch } from '~/components/ui/switch'
import { useTheme } from './theme-provider'

const ModeToggle = () => {
  const id = useId()
  const { theme, setTheme } = useTheme()
  const [checked, setChecked] = useState(theme === 'light')

  useEffect(() => {
    setChecked(theme === 'light')
  }, [theme])

  const toggleSwitch = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className='group inline-flex items-center gap-2  backdrop-blur-sm border border-accent/30 rounded-lg px-2 py-1.5 shadow-sm'>
      <span
        id={`${id}-dark`}
        className='cursor-pointer text-right text-sm font-medium text-primary-foreground transition-colors hover:text-primary-foreground'
        aria-controls={id}
        onClick={() => {
          setTheme('dark')
        }}
      >
        <MoonIcon className={`${theme === 'dark' ? 'text-primary-foreground' : 'text-muted/70'}`} aria-hidden='true' />
      </span>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={toggleSwitch}
        className='data-[state=checked]:bg-primary-foreground/40 data-[state=unchecked]:bg-primary-foreground/30 [&_span]:bg-primary-foreground'
        aria-labelledby={`${id}-dark ${id}-light`}
        aria-label='Toggle between dark and light mode'
      />
      <span
        id={`${id}-light`}
        className='cursor-pointer text-left text-sm font-medium text-primary-foreground transition-colors hover:text-primary-foreground'
        aria-controls={id}
        onClick={() => {
          setTheme('light')
        }}
      >
        <SunIcon className={`${theme === 'light' ? 'text-primary-foreground' : 'text-muted/70 '}`} aria-hidden='true' />
      </span>
    </div>
  )
}

export default ModeToggle
