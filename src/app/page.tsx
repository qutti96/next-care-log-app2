'use client'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'

// import Link from 'next/link'

export default function Home() {

  const { user, profile, loading } = useAuthContext()
  const router = useRouter()
  const supabase = createClientSupabase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/user/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {user ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  ようこそ、{profile?.name || user.email}さん！
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                  ログインに成功しました！ 🎉
                </p>
                <p className="text-md text-gray-600">
                  あなたは <span className="font-semibold text-indigo-600">{profile?.role || '未設定'}</span> ロールです。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                    プロフィール管理
                  </h3>
                  <p className="text-indigo-600 mb-4">
                    あなたとお子さまの情報を管理できます
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    プロフィールを見る
                  </button>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    登園連絡
                  </h3>
                  <p className="text-green-600 mb-4">
                    お子さまの登園・欠席連絡ができます
                  </p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    連絡を作成する
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                登園連絡アプリ
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                保育園と保護者をつなぐ、新しいコミュニケーションアプリです。
              </p>
              <a
                href="/user/login"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ログインまたは新規登録
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}
