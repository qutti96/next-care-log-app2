// 実践的な認証システム実装 ステップ6：プロテクトルートコンポーネントの実装

'use client'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('parent' | 'staff' | 'manager')[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['parent', 'staff', 'manager'],
  redirectTo = '/user/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 未認証の場合はログインページへ
        router.push(redirectTo)
        return
      }

      if (profile && !allowedRoles.includes(profile.role as any)) {
        // 権限不足の場合は適切なページへリダイレクト
        router.push('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || (profile && !allowedRoles.includes(profile.role as any))) {
    return null
  }

  return <>{children}</>
}
