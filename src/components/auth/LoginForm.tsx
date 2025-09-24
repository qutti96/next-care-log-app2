'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'

interface LoginFormProps {
  redirectTo?: string
  className?: string
  // onSuccess?: (user: User) => void
  // onError?: (error: string) => void
}

export default function LoginForm({
  redirectTo = '/',
  className = '',
  // onSuccess,
  // onError
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = getBrowserSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        const errorMessage = error.message
        setError(errorMessage)
        // onError?.(errorMessage)
        console.error('Login error:', error)
        return
      }

      if (data.user) {
        console.log('Login successful:', data.user.email)
        // onSuccess?.(data.user)
        router.push(redirectTo)
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      const errorMessage = '予期せぬエラーが発生しました: ' + message
      setError(errorMessage)
      // onError?.(errorMessage)
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="your@example.com"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="••••••••"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ログイン中...
          </div>
        ) : (
          'ログイン'
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </form>
  )
}
