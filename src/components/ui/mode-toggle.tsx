import { MoonIcon, SunIcon } from 'lucide-react'
import { useId } from 'react'
import { Switch } from '~/components/ui/switch'
import { useTheme } from '~/app/providers/theme-provider'

const ModeToggle = () => {
  const id = useId()
  const { theme, setTheme } = useTheme()

  const isLight = theme === 'light'

  const toggleSwitch = () => {
    setTheme(isLight ? 'dark' : 'light')
  }

  return (
    <div className='group inline-flex items-center gap-2 backdrop-blur-sm border border-accent/30 rounded-lg px-2 py-1.5 shadow-sm'>
      {/* Moon Icon - Dark Mode Button */}
      <button
        type='button'
        onClick={() => setTheme('dark')}
        className='focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-opacity hover:opacity-80'
        aria-label='Switch to dark mode'
        aria-pressed={!isLight}
      >
        <MoonIcon
          size={18}
          className={`transition-colors ${!isLight ? 'text-primary' : 'text-secondary-foreground/50 hover:text-primary-foreground'}`}
        />
      </button>

      {/* Toggle Switch */}
      <Switch
        id={id}
        checked={isLight}
        onCheckedChange={toggleSwitch}
        className='data-[state=checked]:bg-accent-foreground/40 data-[state=unchecked]:bg-accent [&_span]:bg-background'
        aria-label='Toggle between light and dark mode'
      />

      {/* Sun Icon - Light Mode Button */}
      <button
        type='button'
        onClick={() => setTheme('light')}
        className='focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-opacity hover:opacity-80'
        aria-label='Switch to light mode'
        aria-pressed={isLight}
      >
        <SunIcon
          size={18}
          className={`transition-colors ${isLight ? 'text-orange-500' : 'text-secondary-foreground/50 hover:text-primary-foreground'}`}
        />
      </button>
    </div>
  )
}

export default ModeToggle
