'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { key: 'light', name: 'Light', icon: SunIcon },
    { key: 'dark', name: 'Dark', icon: MoonIcon },
    { key: 'system', name: 'System', icon: ComputerDesktopIcon },
  ]

  const currentTheme = themes.find(t => t.key === theme)
  const CurrentIcon = currentTheme?.icon || SunIcon

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
        <CurrentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="sr-only">Toggle theme</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.key
              
              return (
                <Menu.Item key={themeOption.key}>
                  {({ active }) => (
                    <button
                      onClick={() => setTheme(themeOption.key as any)}
                      className={`
                        w-full text-left px-4 py-2 text-sm flex items-center gap-3
                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                        ${isActive ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-200'}
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{themeOption.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                      )}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
          
          {/* Current resolved theme indicator */}
          <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Currently: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
