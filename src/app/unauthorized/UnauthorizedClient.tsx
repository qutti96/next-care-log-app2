'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export function UnauthorizedClient() {
  const router = useRouter()
  const pathname = usePathname()

  // デバッグログ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ UnauthorizedClient: Component mounted', { pathname })
    }
    
    // /unauthorizedページが正しく表示されていることを確認
    if (pathname !== '/unauthorized') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ UnauthorizedClient: Unexpected pathname:', pathname)
      }
    }
  }, [pathname])

  return (
    <div className="space-y-3">
      <button
        onClick={() => router.back()}
        className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>前のページに戻る</span>
      </button>
      
      <Link
        href="/"
        className="w-full inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>ホームに戻る</span>
      </Link>
    </div>
  )
}

