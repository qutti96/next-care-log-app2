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
 * ブラウザクライアントのシングルトンインスタンス
 * 複数インスタンス問題を根本的に解決
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * 統一Supabaseクライアント（唯一の認証対応クライアント）
 * 全ての認証関連処理で使用する単一のクライアント
 */
export const createClientSupabase = () => {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabaseブラウザクライアント作成完了（シングルトン）')
  }
  return browserClient
}

// ===============================
// 既存コード互換性のための調整
// ===============================

/**
 * デフォルトエクスポート（遅延初期化版）
 * 重要：ファイル読み込み時ではなく、使用時にクライアントを作成
 */
export const getSupabaseClient = () => createClientSupabase()

/**
 * 既存コード互換性のためのsupabaseエクスポート
 * 注意：直接使用せず、createClientSupabase()を推奨
 */
export const supabase = {
  get client() {
    return createClientSupabase()
  },
  auth: {
    get signInWithPassword() {
      return createClientSupabase().auth.signInWithPassword.bind(createClientSupabase().auth)
    },
    get signOut() {
      return createClientSupabase().auth.signOut.bind(createClientSupabase().auth)
    },
    get getUser() {
      return createClientSupabase().auth.getUser.bind(createClientSupabase().auth)
    },
    get getSession() {
      return createClientSupabase().auth.getSession.bind(createClientSupabase().auth)
    },
    get onAuthStateChange() {
      return createClientSupabase().auth.onAuthStateChange.bind(createClientSupabase().auth)
    }
  },
  from<T extends keyof Database['public']['Tables'] & string>(table: T) {
    return createClientSupabase().from(table)
  }
}

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
 * シングルトンクライアントを使用
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClientSupabase()// シングルトンクライアント使用

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('認証エラーまたは未ログイン:', authError?.message || '未ログイン')
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
  return profile?.role ? allowedRoles.includes(profile.role) : false
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

// ===============================
// 認証状態管理用ヘルパー（デバッグ強化）
// ===============================

/**
 * 現在の認証セッション取得
 */
export async function getCurrentSession(){
  const supabase = createClientSupabase()
  const{data: {session}, error } = await supabase.auth.getSession()

  if(error){
    console.error('セッション取得エラー：', error)
    return null
  }

  return session
}

/**
 * 認証状態の詳細確認（デバッグ用）
 */
export async function debugAuthState() {
  const supabase = createClientSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  console.log('=== 認証状態デバッグ ===')
  console.log('セッション存在:', !!session)
  console.log('ユーザー存在:', !!session?.user)
  console.log('ユーザーID:', session?.user?.id)
  console.log('メールアドレス:', session?.user?.email)
  console.log('エラー:', error?.message || 'なし')
  console.log('========================')
  
  return { session, error }
}
