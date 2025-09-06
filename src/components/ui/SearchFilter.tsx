import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
  className?: string
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  className = ""
}: SearchFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
