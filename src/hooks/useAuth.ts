// 実践的な認証システム実装ステップ4：型安全な認証フックの実装

'use client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

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

// クライアント専用のSupabaseクライアント使用
  // const supabase = supabase()

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error:', err)
      return null
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          setError(authError.message)
          return
        }

        setUser(user)
        
        if (user) {
          // RLSにより自動的に自分のプロフィールのみ取得
          const profile = await fetchUserProfile(user.id)
          setProfile(profile)
        }
      } catch (err) {
        setError('認証情報の取得に失敗しました')
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // リアルタイム認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setProfile(profile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, profile, loading, error }
}
