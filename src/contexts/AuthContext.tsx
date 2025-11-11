'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  isParent: boolean
  isStaff: boolean
  isManager: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // ★ Enum型対応のロール判定
  const isParent = profile?.role === 'PARENT'
  const isStaff = profile?.role === 'STAFF'
  const isManager = profile?.role === 'MANAGER'
  const isAdmin = profile?.role === 'ADMIN'

  const supabase = useMemo(() => getBrowserSupabase(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }, [supabase])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // 初期セッション取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        } else if (session?.user && isMounted) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    isParent,
    isStaff,
    isManager,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ★ useAuth hookをここで定義（循環参照回避）
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider