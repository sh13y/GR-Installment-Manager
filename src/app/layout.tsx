import type { Metadata, Viewport } from 'next'
import './globals.css'
import { APP_CONFIG } from '@/utils/constants'
import { DataProvider } from '@/components/providers/DataProvider'

export const metadata: Metadata = {
  title: APP_CONFIG.APP_NAME,
  description: 'Comprehensive installment management system for tire sales and payments',
  keywords: ['installment management', 'tire sales', 'business management', 'payment tracking'],
  authors: [{ name: APP_CONFIG.COMPANY_NAME }],
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  )
}
