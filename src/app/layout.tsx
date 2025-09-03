import type { Metadata } from 'next'
import './globals.css'
import { APP_CONFIG } from '@/utils/constants'

export const metadata: Metadata = {
  title: APP_CONFIG.APP_NAME,
  description: 'Comprehensive tire management system for installment-based sales',
  keywords: ['tire management', 'installment sales', 'business management'],
  authors: [{ name: APP_CONFIG.COMPANY_NAME }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
