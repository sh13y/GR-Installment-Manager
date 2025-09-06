import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    "name": "GR Installment Manager",
    "short_name": "GR Manager",
    "description": "Comprehensive installment management system for tire sales and payments",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3B82F6",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "/favicon-32x32.png",
        "sizes": "32x32",
        "type": "image/png"
      },
      {
        "src": "/favicon-16x16.png",
        "sizes": "16x16",
        "type": "image/png"
      },
      {
        "src": "/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/apple-touch-icon.png",
        "sizes": "180x180",
        "type": "image/png",
        "purpose": "apple touch icon"
      }
    ],
    "categories": ["business", "finance", "productivity"],
    "lang": "en",
    "dir": "ltr"
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
