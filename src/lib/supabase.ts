// 実践的な認証システム実装 ステップ3：型安全なSupabaseクライアント設定
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// デバッグ用：環境変数の状態をログ出力
console.log('Environment variables check:', {
  supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
  supabaseAnonKey: supabaseAnonKey ? 'SET' : 'NOT SET',
  supabaseServiceRoleKey: supabaseServiceRoleKey ? 'SET' : 'NOT SET'
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables (URL or ANON_KEY). Check your .env.local file.')
}

// ===============================
// クライアントサイド用（型安全版）
// ===============================

/**
 * 基本クライアント（型安全版）
 * クライアントサイドでの基本的なSupabase操作用
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
* クライアントコンポーネント用（'use client'が必要）
* ブラウザ側でCookieベースの認証セッション管理を自動実行
*/
export const createClientSupabase = () => createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// ===============================
// サーバーサイド用（管理者権限・型安全版）
// ===============================

/**
 * サーバーサイド用Supabaseクライアント（管理者権限）
 * RLSをバイパスしてデータベース操作が可能
 */
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false, // サーバーでは自動更新不要
        persistSession: false    // セッション永続化しない
      }
    })
  : null

// ===============================
// 型定義のエクスポート（開発効率向上）
// ===============================

export type { Database }
export type UserProfile = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

// ===============================
// 便利な認証ヘルパー関数（クライアントサイド用）
// ===============================

/**
 * 現在の認証ユーザーのプロフィールを取得（クライアントサイド用）
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClientSupabase()
  
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
    console.error('getCurrentUserProfile error:', error)
    return null
  }
}

/**
 * ユーザーの権限チェック
 */
export async function checkUserRole(allowedRoles: string[]): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  
  if (!profile || !profile.role) {
    return false
  }
  
  return allowedRoles.includes(profile.role)
}

/**
 * 管理者権限チェック
 */
export async function isManager(): Promise<boolean> {
  return checkUserRole(['manager'])
}

/**
 * スタッフ権限チェック（スタッフまたは管理者）
 */
export async function isStaffOrManager(): Promise<boolean> {
  return checkUserRole(['staff', 'manager'])
}
