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
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="form-input pl-10 w-full"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
