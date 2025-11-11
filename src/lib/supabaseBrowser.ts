//ブラウザ用Supabaseクライアントの作成
'use client'
export {}

// import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // 🚀 型統合

// 🚀 Database型付きSupabaseClient
type TypedSupabaseClient = SupabaseClient<Database>

// HMR対応グローバルシングルトン
type SupabaseGlobal = typeof globalThis & { __supabaseBrowserInstance?: SupabaseClient }
const g = globalThis as SupabaseGlobal

// シングルトンパターンでクライアントを管理
// let client: SupabaseClient | null = null

export function getBrowserSupabase(): TypedSupabaseClient {
  // HMRでも保持されるグローバルインスタンスをチェック
  if (g.__supabaseBrowserInstance) {
    if (process.env.NODE_ENV === 'development') {
      console.log('♻️ 既存Supabaseクライアント再利用（HMR対応）')
    }
    return g.__supabaseBrowserInstance
  }

  // 環境変数の取得と確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 開発時のデバッグ情報
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables check:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING'
    })
  }

  // 環境変数の存在確認
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🆕 新しいSupabaseクライアント作成（App Router最適化版）')
  }

  // シングルトンクライアントの作成
  // if (!client) {
  //   client = createClient(supabaseUrl, supabaseAnonKey, {
  //     auth: {
  //       persistSession: true,        // セッション永続化
  //       autoRefreshToken: true,      // トークン自動更新
  //       detectSessionInUrl: true,    // URLからセッション検出
  //     }
    // })

  // Next.js App Router最適化クライアント作成
  g.__supabaseBrowserInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      //storageKey: 'care-log-app-auth',    // 独自キーで競合完全回避　修正：storageKeyを削除してデフォルトのクッキー命名を使用
      //flowType: 'pkce',                   // PKCE認証フロー（セキュリティ強化）
      persistSession: true,               // セッション永続化
      autoRefreshToken: true,             // トークン自動更新
      detectSessionInUrl: true,           // URLからセッション検出
    },
  })

  // 開発環境でのコンソールアクセス有効化（追加）
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error: 開発中のみデバッグ目的でグローバルに公開
    globalThis.supabase = g.__supabaseBrowserInstance
    console.log('🛠 開発用: supabaseをグローバルに公開')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ 標準Cookie名対応Supabaseクライアント作成完了')
  }

  // return client
  return g.__supabaseBrowserInstance!
}


// 型安全性のためのヘルパー関数
export function getSupabaseAuth() {
  return getBrowserSupabase().auth
}

// セッション管理のヘルパー関数
export async function getCurrentUser() {
  const supabase = getBrowserSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting current session:', error)
    return null
  }

  return session?.user?? null
}

// サインアウトのヘルパー関数
export async function signOut() {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }

  // 完全サインアウト（インスタンスもリセット）
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 サインアウト完了（インスタンスリセット）')
    g.__supabaseBrowserInstance = undefined
  }

  return true
}

// デバッグ用：インスタンスリセット関数
export function resetSupabaseInstance() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Supabaseインスタンス手動リセット')
    g.__supabaseBrowserInstance = undefined
  }
}

