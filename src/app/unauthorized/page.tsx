import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { UnauthorizedClient } from './UnauthorizedClient'

// サーバーコンポーネントとして実装（リダイレクトを確実に処理）
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function UnauthorizedPage() {
  // デバッグログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ UnauthorizedPage: Rendering unauthorized page')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            このページにアクセスする権限がありません。
            <br />
            他のユーザーの情報にアクセスすることはできません。
          </p>
          
          <UnauthorizedClient />
        </div>
      </div>
    </div>
  )
}

