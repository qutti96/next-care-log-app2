'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  // ★ Enum型対応のロール判定
  const isParent = profile?.role === 'PARENT'
  const isStaff = profile?.role === 'STAFF'
  const isManager = profile?.role === 'MANAGER'
  const isAdmin = profile?.role === 'ADMIN'

  const supabase = useMemo(() => getBrowserSupabase(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 AuthContext: Fetching profile for:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ AuthContext: Profile fetch error:', error)
        setProfile(null)
        return
      }

      console.log('✅ AuthContext: Profile fetched successfully')
      setProfile(data)
    } catch (error) {
      console.error('💥 AuthContext: Profile fetch unexpected error:', error)
      setProfile(null)
    }
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    console.log('🚀 AuthContext: Initializing...')

    const initializeAuth = async () => {
      try {
        // 初期セッション取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('🔍 AuthContext: Initial session check:', {
          hasSession: !!session, 
          userId: session?.user?.id,
          error: sessionError?.message 
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
        } else if (session?.user && isMounted) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else if (isMounted) {
          console.log('ℹ️ AuthContext: No active session')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('💥 AuthContext: Auth initialization error:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          console.log('✅ AuthContext: Initialization complete, loading = false')
          setLoading(false)
        }
      }
    }

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        console.log('🔄 AuthContext: State change:', {
          event, 
          hasSession: !!session,
          userId: session?.user?.id
        })

        try {
          if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          } else {
            console.log('🔓 AuthContext: Clearing user state')
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('💥 AuthContext: State change error:', error)
          if (isMounted) {
            setUser(null)
            setProfile(null)
          }
        } finally {
          if (isMounted) {
            console.log('✅ AuthContext: State change complete, loading = false')
            setLoading(false)
          }
        }
      }
    )

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      console.log('🧹 AuthContext: Cleanup complete')
    }
  }, [fetchProfile, supabase])

  const signOut = useCallback(async () => {
    try {
      console.log('🔄 AuthContext: Signing out...')
      setLoading(true)

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ AuthContext: Sign out error:', error)
      } else {
        console.log('✅ AuthContext: Sign out successful')
        setUser(null)
        setProfile(null)
        router.push('/users/login')
      }
    } catch (error) {
      console.error('💥 AuthContext: Sign out unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const value: AuthContextType = useMemo(() => ({
    user,
    profile,
    loading,
    signOut,
    isParent,
    isStaff,
    isManager,
    isAdmin,
  }), [user, profile, loading, signOut, isParent, isStaff, isManager, isAdmin])

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