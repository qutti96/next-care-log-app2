// 実践的な認証システム実装 認証コンテキストプロバイダーの実装

'use client'
import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isParent: boolean
  isStaff: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, profile, loading, error } = useAuth()

  // ロールベースの便利なフラグ（要件定義書の権限設計対応）
  const isParent = profile?.role === 'parent'
  const isStaff = profile?.role === 'staff'
  const isManager = profile?.role === 'manager'

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    isParent,
    isStaff,
    isManager,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}