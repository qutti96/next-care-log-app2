// middleware.tsの役割：
// セッション同期のゲートウェイ - 全リクエスト前の認証セッション同期
// トークンリフレッシュ - 期限切れ寸前のトークン自動更新
// クッキー伝播 - サーバー・クライアント間のセッション情報統一

//getSession()の使用 - getUser()より確実なセッション同期
// 効率的なsetAll実装 - 不要なNextResponse.next()呼び出しを回避
// クッキー一括処理 - Supabaseが要求する複数クッキーを効率的に処理

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 🚀 追加：ログレベルのフォールバック
const LOG_LEVEL = process.env.MIDDLEWARE_LOG_LEVEL ??
  (process.env.NODE_ENV === 'development' ? 'debug' : 'error')

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 🚀 修正：NextResponse.next()を呼ばない
          // 初期化済みのresオブジェクトに累積的にクッキーを設定
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 🚀 getSession推奨（自動リフレッシュ対応）
  const { data: { session }, error } = await supabase.auth.getSession()

  // デバッグログ（LOG_LEVELで制御）
  if (LOG_LEVEL === 'debug') {
    const allCookies = req.cookies.getAll()
    const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))

    console.log('🔍 Middleware Debug:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      error: error?.message,
      totalCookies: allCookies.length,
      supabaseCookies: supabaseCookies.map(c => c.name),
    })
  }

  // 🚀 追加：エラーは本番でも出力（オプション）
  if (error && LOG_LEVEL !== 'none') {
    console.error('❌ Middleware Session Error:', error.message)
  }

return res
}

export const config = {
  matcher: [
    // 🚀 修正：(svg|png|...) を (?:svg|png|...) に変更
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
