// 実践的な認証システム実装 ステップ6：プロテクトルートコンポーネントの実装

'use client'
import { useAuth } from '@/contexts/AuthContext'
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
  redirectTo = '/users/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 未認証の場合はログインページへ
        router.push(redirectTo)
        return
      }

      const role = (profile as unknown as { role?: 'parent' | 'staff' | 'manager' }).role
      if (role && !allowedRoles.includes(role)) {
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

  {
    const role = (profile as unknown as { role?: 'parent' | 'staff' | 'manager' })?.role
    if (!user || (role && !allowedRoles.includes(role))) {
      return null
    }
  }

  return <>{children}</>
}
