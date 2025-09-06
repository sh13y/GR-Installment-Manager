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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  )
}
