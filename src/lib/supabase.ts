import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

// クライアントサイド用Supabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用Supabaseクライアント（管理者権限）
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false, // サーバーでは自動更新不要
      persistSession: false    // セッション永続化しない
    }
  }
)

