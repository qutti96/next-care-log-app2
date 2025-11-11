'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'
import Link from 'next/link'
import { User, FileText, LogOut, AlertCircle } from 'lucide-react'


export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = getBrowserSupabase()
  // プロフィール登録状況の判定
  const hasProfile = Boolean(profile?.name)
  const role = profile?.role


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/users/login')
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
                  あなたは <span className="font-semibold text-indigo-600">{role || '未設定'}</span> ロールです。
                </p>
                {/* プロフィール未登録時の案内 */}
                {!hasProfile && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-amber-800 font-medium">
                      プロフィールの登録を完了して、すべての機能を利用しましょう！
                    </p>
                  </div>
                )}
              </div>

              {/* メイン機能カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* プロフィール管理カード */}
                <div className="bg-indigo-50 p-6 rounded-lg border-2 border-transparent hover:border-indigo-200 transition-all duration-200">
                  <div className="flex items-center mb-3">
                    <User className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                      プロフィール管理
                    </h3>
                  </div>
                  <p className="text-indigo-600 mb-4">
                    {hasProfile 
                      ? 'あなたとお子さまの情報を確認・編集できます'
                      : 'あなたとお子さまの基本情報を登録しましょう'
                    }
                  </p>
                  {hasProfile ? (
                    <Link href={`/users/${user.id}`}
                    prefetch={false}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>プロフィールを見る</span>
                    </Link>
                  ) : (
                    <Link href={`/users/${user.id}/create`}
                    prefetch={false}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 animate-pulse"
                    >
                      <User className="h-4 w-4" />
                      <span>プロフィールを登録する</span>
                    </Link>
                  )}
                </div>
                {/* 登園連絡カード */}
                <div className={`bg-green-50 p-6 rounded-lg border-2 transition-all duration-200 ${
                  hasProfile 
                    ? 'border-transparent hover:border-green-200' 
                    : 'border-gray-200 opacity-75'
                }`}>
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-800">
                      登園連絡
                    </h3>
                  </div>
                  <p className="text-green-600 mb-4">
                  {hasProfile
                      ? 'お子さまの登園・欠席連絡ができます'
                      : 'プロフィール登録完了後に利用できます'
                    }
                  </p>
                  <button
                    onClick={() => {
                      if (hasProfile) {
                        // TODO: 登園連絡機能実装後に適切なパスに変更
                        router.push('/child-selection')
                      } else {
                        router.push(`/users/${user.id}/create`)
                      }
                    }}
                    disabled={!hasProfile}
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                      hasProfile
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    title={!hasProfile ? '先にプロフィールを登録してください' : undefined}
                  >
                    <FileText className="h-4 w-4" />
                    <span>
                      {hasProfile ? '連絡を作成する' : 'プロフィール登録が必要'}
                    </span>
                  </button>
                </div>
              </div>

              {/* プロフィール未登録時の追加ガイダンス */}
              {!hasProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">
                    🚀 はじめての方へ
                  </h4>
                  <div className="space-y-2 text-blue-700 mb-4">
                    <p>• <strong>ステップ1：</strong> 保護者の基本情報を登録</p>
                    <p>• <strong>ステップ2：</strong> お子さまの情報を入力</p>
                    <p>• <strong>ステップ3：</strong> 登園連絡機能が利用可能に</p>
                  </div>
                  <Link href={`/users/${user.id}/create`}
                  prefetch={false}
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    今すぐ始める
                  </Link>
                </div>
              )}
              {/* ログアウトボタン */}
              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            </>
          ) : (
            /* 未ログイン時の表示 */
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                登園連絡アプリ
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                保育園と保護者をつなぐ、新しいコミュニケーションアプリです。
              </p>
              <Link
                href="/users/login"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                ログインまたは新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}
