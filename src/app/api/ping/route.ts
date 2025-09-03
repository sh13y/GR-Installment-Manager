import { NextResponse } from 'next/server'

export async function GET() {
  // Ultra-lightweight ping endpoint
  return NextResponse.json(
    { 
      ping: 'pong', 
      time: Date.now() 
    }, 
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    }
  )
}

export async function POST() {
  return GET()
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
