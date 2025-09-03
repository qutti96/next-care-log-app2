//すべてのAPI Routeで使い回せる認証ヘルパー関数
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

//認証済みユーザーの取得
export async function getAuthenticatedUser() {
  console.log('=== API Route サーバーサイド認証チェック開始 ===')

  // サーバーサイドでは毎回createServerClientでCookieを取得
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, ...options }) => {
            cookies().set(name, value, options as { path?: string; domain?: string; maxAge?: number; secure?: boolean; httpOnly?: boolean; sameSite?: 'strict' | 'lax' | 'none' })
          })
        },
      },
    }
  )

  console.log('=== API Route サーバーサイドSupabaseクライアント作成完了 ===')

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('サーバーサイド認証結果：', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: error?.message || 'なし'
    })

    if (error|| !user) {
      console.error('❌ サーバーサイド認証失敗:', error)
      return null
    }

    console.log('✅ サーバーサイド認証成功:', user.email)
    return user
  } catch (err) {
    console.error('❌ サーバーサイド認証例外:', err)
    return null
  }
}

//未認証エラーレスポンス
export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'ログインが必要です' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

//一般エラーレスポンス
export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}