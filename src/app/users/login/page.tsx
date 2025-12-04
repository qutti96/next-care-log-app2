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

      // 🚀 改善: プロフィール完成度を判定（create/page.tsxと同じロジック）
      const [profileResult, childrenResult] = await Promise.all([
        supabase
          .from('users')
          .select('name, name_kana, tel, photo_url')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('children')
          .select('id')
          .eq('parent_id', user.id)
          .is('deleted_at', null)
      ])

      const { data: profileData } = profileResult
      const { data: children } = childrenResult

      // 🚀 改善: 業務ロジックに基づいた完成判定
      const hasBasicInfo = !!profileData?.name
      const hasOptionalFields = !!(
        profileData?.name_kana || 
        profileData?.tel || 
        profileData?.photo_url
      )
      const hasChildren = (children?.length ?? 0) > 0

      // 保育園アプリでは「基本情報 + 子ども情報」が揃って初めて完成
      const isProfileComplete = hasBasicInfo && hasOptionalFields && hasChildren

      // プロフィールが完成している場合のみprofileを設定
      if (isProfileComplete) {
        profile = profileData
      }
    }
  } catch (error) {
    console.error('❌ LoginPage: Auth check failed:', error)
  }

  // 🚀 重要：リダイレクト処理をtry-catchの外に配置
  // 認証済みユーザーがログインページに直接アクセスした場合のみリダイレクト
  // /unauthorizedページからのリダイレクトの場合は、クライアント側で処理するため、
  // サーバー側ではリダイレクトしない（クライアント側のuseEffectで処理）
  // 注意: この方法は完全ではないが、/unauthorizedページが表示されることを優先
  
  // 認証済みユーザーがログインページに直接アクセスした場合のみリダイレクト
  // ただし、/unauthorizedページからのリダイレクトの場合は、クライアント側で処理
  // サーバー側では、認証済みユーザーでもログインページを表示する
  // クライアント側でリダイレクトが必要かどうかを判断する
  // 一時的に無効化して、/unauthorizedページが表示されることを確認
  // 🚀 改善: プロフィールが完成している場合のみリダイレクト
  if (user && profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 LoginPage: Redirecting authenticated user with complete profile:', {
        userId: user.id,
        hasProfile: true,
        redirectTo: 'edit'
      })
    }

    // redirect()の例外スローは正常動作 - try-catchで囲まない
    redirect(`/users/${user.id}/edit`)
  } else if (user && !profile) {
    // 🚀 改善: プロフィールが未完成の場合は/createにリダイレクト
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 LoginPage: Redirecting authenticated user with incomplete profile:', {
        userId: user.id,
        hasProfile: false,
        redirectTo: 'create'
      })
    }

    redirect(`/users/${user.id}/create`)
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