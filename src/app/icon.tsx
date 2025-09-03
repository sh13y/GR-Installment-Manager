import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#3B82F6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid #1E40AF',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'Arial',
          }}
        >
          GR
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
