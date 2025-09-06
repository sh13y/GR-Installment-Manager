'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { NAVIGATION, USER_ROLES } from '@/utils/constants'
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { APP_CONFIG } from '@/utils/constants'

const icons = {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
}

interface NavigationItem {
  name: string
  href: string
  icon: string
  adminOnly?: boolean
}

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const { userProfile, signOut } = useAuth()

  const navigationItems = Object.values(NAVIGATION).filter((item: NavigationItem) => {
    if (item.adminOnly) {
      return userProfile?.role === USER_ROLES.SUPER_ADMIN
    }
    return true
  })

  const handleSignOut = async () => {
    await signOut()
  }

  const NavLink = ({ item }: { item: NavigationItem }) => {
    const IconComponent = icons[item.icon as keyof typeof icons]
    const isActive = pathname === item.href

    return (
      <Link
        href={item.href}
        className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
        onClick={() => setIsMobileOpen(false)}
      >
        <IconComponent className="h-5 w-5 mr-3" />
        {item.name}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-20"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center min-w-0">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">GR</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 truncate">
                {APP_CONFIG.APP_NAME}
              </span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile?.role?.replace('_', ' ') || 'Staff'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
