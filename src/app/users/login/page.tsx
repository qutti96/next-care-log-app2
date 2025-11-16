// Server Component（'use client'不要）
import LoginForm from '@/components/auth/LoginForm'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

// 🚀 重要：動的レンダリング強制（静的最適化を防ぐ）
export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabase()

    // 🚀 修正：認証チェックのみをtry-catchで囲む
    let user = null
    let profile = null

    try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 LoginPage: Auth check result:', { 
        hasUser: !!authUser,
        userId: authUser?.id,
        error: error?.message
      })
    }

    if (authUser && !error) {
      user = authUser

      // プロフィール状態確認
      const { data: profileData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .maybeSingle()

        profile = profileData
    }
  } catch (error) {
    console.error('❌ LoginPage: Auth check failed:', error)
  }

  // 🚀 重要：リダイレクト処理をtry-catchの外に配置
  if (user && profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 LoginPage: Redirecting authenticated user:', {
        userId: user.id,
        hasProfile: !!profile?.name,
        redirectTo: profile?.name ? 'edit' : 'create'
      })
    }

    // redirect()の例外スローは正常動作 - try-catchで囲まない
    if (profile?.name) {
      redirect(`/users/${user.id}/edit`)
    } else {
      redirect(`/users/${user.id}/create`)
    }
  }

  // 未認証ユーザーのみここに到達
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ LoginPage: Showing login form for unauthenticated user')
  }

  // URLパラメータをサーバー側で安全に取得
  const redirectTo = typeof searchParams?.redirectTo === 'string'
    ? searchParams.redirectTo
    : '/'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインしてください
          </p>
        </div>
        
        <LoginForm redirectTo={redirectTo}/>
        
        <div className="text-center">
          <a
            href="/users/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            アカウントをお持ちでない方はこちら
          </a>
        </div>
      </div>
    </div>
  )
}