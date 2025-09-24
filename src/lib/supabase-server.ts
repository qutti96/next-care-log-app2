// src/lib/supabase-server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
// import type { UserProfile } from '@/types/user'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables (URL or ANON_KEY). Check your .env.local file.')
}

// ===============================
// Next.js 14 App Router専用クライアント（サーバーサイド）
// ===============================

/**
 * サーバーサイド用Supabaseクライアント
 * Route HandlerやServer Componentで使用
 */
export const createServerSupabase = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component での setAll は無視（middleware で処理）
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// ===============================
// 便利な認証ヘルパー関数（サーバーサイド専用）
// ===============================
/**
 * 現在の認証ユーザーのプロフィールを取得（サーバーサイド用）
 * RLSにより自動的に自分のプロフィールのみ取得可能
 */
export async function getCurrentUserProfileServer(): Promise<Database['public']['Tables']['users']['Row'] | null> {
  const supabase = createServerSupabase()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error('getCurrentUserProfileServer error:', error)
    return null
  }
}

/**
 * ユーザーの権限チェック
 * @deprecated: usersテーブルにroleカラムがないため、この関数は現在機能しません。
 *              ロール管理を実装する場合はPrismaスキーマとDBにroleカラムを追加してください。
 */

export async function checkUserRole(allowedRoles: string[]): Promise<boolean> {
  console.warn('checkUserRole: usersテーブルにroleカラムが未実装のため常にfalseを返します')
  return false

  // TODO: ロール管理実装後に有効化
  // const profile = await getCurrentUserProfileServer()
  //
  // if (!profile || !profile.role) {
  //   return false
  // }

  // return allowedRoles.includes(profile.role)
}

/**
 * スタッフ権限チェック（スタッフまたは管理者）
 */
export async function isStaffOrManager(): Promise<boolean> {
  console.warn('isStaffOrManager: ロール機能未実装のため常にfalseを返します')
  return false
  // return checkUserRole(['staff', 'manager'])
}