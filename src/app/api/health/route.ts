import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check that returns current timestamp
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'GR Installment Manager is running',
      version: '1.0.0'
    }

    // Return successful response
    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    // Return error response if something goes wrong
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// Also handle POST requests (some monitoring services use POST)
export async function POST() {
  return GET()
}
