// 実践的な認証システム実装ステップ4：型安全な認証フックの実装

'use client'
import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase, supabaseAdmin, UserProfile } from '@/lib/supabase'

// 型安全なユーザープロファイル型
// type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🎯 統一されたSupabaseクライアントをフックの最上位で取得
  // これがこのフック内で使用される唯一のクライアントインスタンス
  const supabase = createClientSupabase()

  // fetchUserProfile を useCallback でメモ化
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('📋 プロファイル取得開始:', userId)

      const { data, error } = await supabase// 統一されたsupabaseを使用
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        //RLS権限エラーの適切な処理
        if (error.code === '42501') {
          console.warn('⚠️ RLS権限エラー（開発中は正常）:', error.message)
          console.warn('💡 public.usersテーブルのRLSポリシーを確認してください')
        } else if (error.code === 'PGRST116') {
          console.warn('⚠️ プロファイルデータが見つかりません（初回ログイン時は正常）')
        }
        return null
      }

      console.log('✅ プロファイル取得成功:', data?.email || data?.name)
      return data
    } catch (err) {
      console.error('❌ プロファイル取得例外:', err)
      return null
    }
  }, [supabase])

  useEffect(() => {
    console.log('🔄 useAuth: 認証状態監視開始（統一クライアント版）')

    const getUser = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 初期ユーザー取得開始')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('❌ 認証エラー:', authError.message)
          setError(authError.message)
          setUser(null)
          setProfile(null)
          return
        }

        console.log('👤 初期ユーザー:', user?.email || 'なし')
        setUser(user)
        
        if (user) {
          // RLSにより自動的に自分のプロフィールのみ取得
          const userProfile = await fetchUserProfile(user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('❌ 認証初期化エラー:', err)
        setError('認証情報の取得に失敗しました')
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    //初期ユーザー情報取得
    getUser()

    // リアルタイム認証状態変更の監視（統一クライアント使用）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email||'なし')
        
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 ログイン検出、プロファイル取得開始')
          setUser(session.user)
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
        } else if(event === 'SIGNED_OUT'){
          console.log('ログアウト検出')
          setUser(null)
          setProfile(null)
        } else if(event === 'TOKEN_REFRESHED'){
          console.log('🔄 トークン更新検出')
          //ユーザー情報は維持、必要に応じてプロファイル再取得
          if(session?.user && !profile){
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          }
        }
        setLoading(false)
      }
    )

    return () => {
      console.log('🛑 useAuth: 認証監視終了')
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, profile])

  return { user, profile, loading, error }
}
