'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'

// SSG回避のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getBrowserSupabase()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 認証コールバック処理開始')

        // OAuth プロバイダーからのエラーを早期チェック
        const oauthError = searchParams.get('error')
        if (oauthError) {
          setError(`認証に失敗しました: ${oauthError}`)
          return
        }

        // URLからコードを取得してセッションに交換
        const code = searchParams.get('code')
        if (!code) {
          setError('認証コードが見つかりません')
          return
        }

        console.log('📧 認証コード確認済み - セッション作成中...')
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (sessionError) {
          setError(sessionError.message)
          return
        }

        const user = data.session?.user
        if (!user) {
          setError('ユーザー情報の取得に失敗しました')
          return
        }

        console.log('✅ セッション作成成功:', user.email)

        // usersテーブルに安全に挿入（upsert使用）
        const name = (user.user_metadata?.name as string) || user.email!.split('@')[0]
        console.log('📝 usersテーブル作成中...', { userId: user.id, name })

        // 🚀 修正: 必須フィールドを全て含める
        const timestamp = new Date().toISOString()

        const { error: upsertError } = await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email!,
              name: name,
              name_kana: null,
              tel: null,
              photo_url: null,
              role: 'PARENT',
              created_at: timestamp,
              updated_at: timestamp,
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false
            }
          )

        if (upsertError) {
          setError(`プロフィール作成に失敗しました: ${upsertError.message}`)
          return
        }

        console.log('✅ usersテーブル作成成功 - プロフィール登録へ')

        // プロフィール登録画面にリダイレクト
        router.replace(`/users/${user.id}/create`)

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(`認証処理でエラーが発生しました: ${message}`)
        console.error('❌ Auth callback error:', err)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase])

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <span className="text-lg">サインイン処理中です。少々お待ちください...</span>
        </div>
        <p className="mt-4 text-gray-600">
          メール認証を完了し、プロフィール登録画面に移動します
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            認証エラー
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/users/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    )
  }

  return null
}

function AuthCallbackLoading() {
  return (
    <div className="container mx-auto py-16 text-center">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-lg">認証処理を準備中...</span>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  )
}