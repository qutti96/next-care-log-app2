//ブラウザ用Supabaseクライアントの作成
'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// シングルトンパターンでクライアントを管理
let client: SupabaseClient | null = null

export function getBrowserSupabase(): SupabaseClient {
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

  // シングルトンクライアントの作成
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,        // セッション永続化
        autoRefreshToken: true,      // トークン自動更新
        detectSessionInUrl: true,    // URLからセッション検出
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabaseブラウザクライアント作成完了（シングルトン）')
    }
  }

  return client
}

// 型安全性のためのヘルパー関数
export function getSupabaseAuth() {
  return getBrowserSupabase().auth
}

// セッション管理のヘルパー関数
export async function getCurrentUser() {
  const supabase = getBrowserSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

// サインアウトのヘルパー関数
export async function signOut() {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
  
  return true
}
