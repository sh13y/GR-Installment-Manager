export default function FaviconTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Favicon Test Page</h1>
      <p className="mb-4">This page helps test if favicons are loading correctly on Vercel.</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Direct Links Test:</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><a href="/favicon.ico" target="_blank" className="text-blue-600 hover:underline">favicon.ico (public root)</a></li>
            <li><a href="/images/favicon.ico" target="_blank" className="text-blue-600 hover:underline">favicon.ico (images folder)</a></li>
            <li><a href="/icon.ico" target="_blank" className="text-blue-600 hover:underline">icon.ico (app directory)</a></li>
            <li><a href="/favicon-16x16.png" target="_blank" className="text-blue-600 hover:underline">favicon-16x16.png (public root)</a></li>
            <li><a href="/images/favicon-16x16.png" target="_blank" className="text-blue-600 hover:underline">favicon-16x16.png (images folder)</a></li>
            <li><a href="/favicon-32x32.png" target="_blank" className="text-blue-600 hover:underline">favicon-32x32.png (public root)</a></li>
            <li><a href="/images/favicon-32x32.png" target="_blank" className="text-blue-600 hover:underline">favicon-32x32.png (images folder)</a></li>
            <li><a href="/apple-touch-icon.png" target="_blank" className="text-blue-600 hover:underline">apple-touch-icon.png (public root)</a></li>
            <li><a href="/images/apple-touch-icon.png" target="_blank" className="text-blue-600 hover:underline">apple-touch-icon.png (images folder)</a></li>
            <li><a href="/android-chrome-192x192.png" target="_blank" className="text-blue-600 hover:underline">android-chrome-192x192.png (public root)</a></li>
            <li><a href="/images/android-chrome-192x192.png" target="_blank" className="text-blue-600 hover:underline">android-chrome-192x192.png (images folder)</a></li>
            <li><a href="/android-chrome-512x512.png" target="_blank" className="text-blue-600 hover:underline">android-chrome-512x512.png (public root)</a></li>
            <li><a href="/images/android-chrome-512x512.png" target="_blank" className="text-blue-600 hover:underline">android-chrome-512x512.png (images folder)</a></li>
            <li><a href="/site.webmanifest" target="_blank" className="text-blue-600 hover:underline">site.webmanifest (Static)</a></li>
            <li><a href="/manifest.json" target="_blank" className="text-blue-600 hover:underline">manifest.json (Static)</a></li>
            <li><a href="/api/site.webmanifest" target="_blank" className="text-blue-600 hover:underline">site.webmanifest (API)</a></li>
            <li><a href="/api/manifest.json" target="_blank" className="text-blue-600 hover:underline">manifest.json (API)</a></li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Favicon Display Test:</h2>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <img src="/favicon-32x32.png" alt="32x32 favicon" width="32" height="32" />
              <p className="text-xs">32x32 (public)</p>
            </div>
            <div className="text-center">
              <img src="/images/favicon-32x32.png" alt="32x32 favicon" width="32" height="32" />
              <p className="text-xs">32x32 (images)</p>
            </div>
            <div className="text-center">
              <img src="/favicon-16x16.png" alt="16x16 favicon" width="16" height="16" />
              <p className="text-xs">16x16 (public)</p>
            </div>
            <div className="text-center">
              <img src="/images/favicon-16x16.png" alt="16x16 favicon" width="16" height="16" />
              <p className="text-xs">16x16 (images)</p>
            </div>
            <div className="text-center">
              <img src="/apple-touch-icon.png" alt="Apple touch icon" width="48" height="48" />
              <p className="text-xs">Apple (public)</p>
            </div>
            <div className="text-center">
              <img src="/images/apple-touch-icon.png" alt="Apple touch icon" width="48" height="48" />
              <p className="text-xs">Apple (images)</p>
            </div>
            <div className="text-center">
              <img src="/android-chrome-192x192.png" alt="Android Chrome 192" width="48" height="48" />
              <p className="text-xs">Android 192 (public)</p>
            </div>
            <div className="text-center">
              <img src="/images/android-chrome-192x192.png" alt="Android Chrome 192" width="48" height="48" />
              <p className="text-xs">Android 192 (images)</p>
            </div>
            <div className="text-center">
              <img src="/android-chrome-512x512.png" alt="Android Chrome 512" width="64" height="64" />
              <p className="text-xs">Android 512 (public)</p>
            </div>
            <div className="text-center">
              <img src="/images/android-chrome-512x512.png" alt="Android Chrome 512" width="64" height="64" />
              <p className="text-xs">Android 512 (images)</p>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">
            If you can see the images above and the links work, then the favicon files are being served correctly.
            The issue might be browser caching. Try:
          </p>
          <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
            <li>Hard refresh (Ctrl+F5 or Cmd+Shift+R)</li>
            <li>Clear browser cache</li>
            <li>Check in incognito/private mode</li>
            <li>Wait a few minutes for Vercel CDN to update</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
