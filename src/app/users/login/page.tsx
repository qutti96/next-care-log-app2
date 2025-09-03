'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UserLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  //登録完了メッセージの表示
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setMessage(message)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleLogin called');
    setLoading(true)
    setError(null)

    try {
      console.log('before signInWithPassword');
      const {data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      console.log('after signInWithPassword');
      console.log('signInWithPassword result:', { data, error })

      if (error) {
        setError(error.message)
      } else {
        console.log('✅ ログイン成功、遷移処理開始');
        // Step 1: 即座に遷移を試行
        console.log('🔄 遷移試行 1: router.replace');
        router.replace('/');

        // Step 2: 短い遅延後にrouter.pushを試行（フォールバック）
        setTimeout(() => {
          if(window.location.pathname === '/users/login'){
            console.log('🔄 遷移試行 2: router.push (300ms後)');
            router.push('/')
          }
        }, 300)
      }
      // Step 3: 中程度の遅延後に状態確認して遷移
      setTimeout(() => {
        if (window.location.pathname === '/users/login') {
          console.log('🔄 遷移試行 3: 状態確認後のrouter.push (800ms後)');
          router.push('/');
        }
      }, 800);
      // Step 4: 最終手段として強制遷移
      setTimeout(() => {
        if (window.location.pathname === '/users/login') {
          console.log('🔄 遷移試行 4: 強制遷移 window.location.href (1500ms後)');
          window.location.href = '/';
        }
      }, 1500);
    } catch (err) {
      console.error('Login error (catch):', err)
      setError('ログイン処理中にエラーが発生しました')
    } finally {
      // 遷移が開始されるまでローディング状態を維持
      // エラー時のみローディング解除
      if (error) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          保護者ログイン
        </h2>
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="パスワード"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>エラー:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログインボタン'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          アカウントをお持ちでないですか？{' '}
          <a href="/users/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            新規登録はこちら
          </a>
        </p>
      </div>
    </div>
  )
}

