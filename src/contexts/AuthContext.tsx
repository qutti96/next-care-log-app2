'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'
import type { User, Subscription } from '@supabase/supabase-js'
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
  // 🚀 routerは使用していない（signOutでwindow.location.hrefを使用）

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
    let subscription: Subscription | null = null
    let initializationComplete = false

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

        if(!isMounted) {
          console.log('⚠️ AuthContext: Component unmounted, skipping state update')
          return
        }
        
        if (sessionError) {
          console.error('❌ AuthContext: Session error:', sessionError)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          setUser(session.user)
          try{
            await fetchProfile(session.user.id)
          } catch (profileError) {
            console.error('❌ AuthContext: Profile fetch failed:', profileError)
            setProfile(null)
          }
        } else {
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
          initializationComplete = true
          setLoading(false)
          console.log('✅ AuthContext: Initialization complete, loading = false')
        } else {
          console.log('⚠️ AuthContext: Component unmounted during initialization')
        }
      }
    }

    // 認証状態変更の監視
    const setupAuthListener = () => {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return

          // INITIAL_SESSIONイベントは初期化で既に処理済みなのでスキップ
          if (event === 'INITIAL_SESSION' && initializationComplete) {
            console.log('🔄 AuthContext: Skipping INITIAL_SESSION (already handled)')
            if (isMounted) {
              setLoading(false)
            }
            return
          }

          console.log('🔄 AuthContext: State change:', {
            event, 
            hasSession: !!session,
            userId: session?.user?.id
          })

          // 🚀 修正: SIGNED_OUTイベント時は、signOut関数でwindow.location.hrefが実行されるため、
          // ここでは何も処理せずに早期リターン（window.location.hrefでページ全体がリロードされるため不要）
          if (event === 'SIGNED_OUT') {
            console.log('🔓 AuthContext: SIGNED_OUT event detected, skipping state update (redirecting)')
            // signOut関数でwindow.location.hrefが実行されるため、ここでは何も処理しない
            return
          }

          try{
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
            setProfile(null)
          } finally {
            //状態変化時も必ずloading解除
            if (isMounted) {
            setLoading(false)
            console.log('✅ AuthContext: State change complete, loading = false')
          }
        }
      })
      subscription = authSubscription
    }

    //初期化とリスナー設定
    initializeAuth()
    setupAuthListener()

    //5秒後にloading解除（エラー時のフォールバック、初期化完了後は不要）
    const timeoutId = setTimeout(() => {
      if(isMounted && !initializationComplete){
        console.warn('⚠️ AuthContext: Timeout reached, forcing loading = false')
        setLoading(false)
      }
    }, 5000)

    //クリーンアップ関数
    return () => {
      isMounted = false
      if(subscription){
        subscription.unsubscribe()
      }
      clearTimeout(timeoutId)
      console.log('🧹 AuthContext: Cleanup complete')
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      console.log('🔄 AuthContext: Signing out...')
      console.log('🔄 AuthContext: Current user:', user?.email)

      // 🚀 重要：即座にリダイレクトを実行（supabase.auth.signOut()の完了を待たない）
      // 別タブでデータ更新した場合でも、確実に/users/loginに遷移する
      console.log('🔄 AuthContext: Redirecting to login page immediately...')
      // window.location.replace()を使用（ブラウザの履歴に残らない）
      window.location.replace('/users/login')
      
      // 🚀 バックグラウンドでsignOutを実行（リダイレクト後も実行される）
      // エラーハンドリングは行うが、リダイレクトは既に実行済み
      supabase.auth.signOut().then(({ error }) => {
        if (error) {
          console.error('❌ AuthContext: Sign out error (after redirect):', error)
        } else {
          console.log('✅ AuthContext: Sign out successful (after redirect)')
        }
      }).catch((error) => {
        console.error('💥 AuthContext: Sign out unexpected error (after redirect):', error)
      })
    } catch (error) {
      console.error('💥 AuthContext: Sign out unexpected error:', error)
      // 例外が発生しても必ずリダイレクト
      console.log('🔄 AuthContext: Forcing redirect after exception')
      window.location.replace('/users/login')
    }
  }, [supabase, user])

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