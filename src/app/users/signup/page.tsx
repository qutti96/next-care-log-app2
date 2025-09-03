'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
//import { createClientSupabase } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export default function UserSignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  //const supabase = createClientSupabase()


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('登録開始:', formData.email)
      console.log('パスワード:', formData.password)
      console.log('氏名:', formData.name)
      console.log('ロール:', 'parent')

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'parent', // デフォルトで保護者ロール
          }
        }
      })

      if (error) {
        console.error('登録エラー:', error)
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        console.log('登録成功:', data.user)

        // 成功メッセージを表示後、トップページに遷移
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    } catch (err) {
      setError('登録処理中にエラーが発生しました')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">登録完了！</h2>
          <p className="text-gray-600 mb-4">
            ユーザー登録が正常に完了しました。<br />
            Supabase Studio（http://localhost:54323）で確認してください。
          </p>
          <p className="text-sm text-gray-500">3秒後にトップページに移動します...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          保護者新規登録
        </h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              氏名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="山田太郎"
            />
          </div>
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
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="6文字以上"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録ボタン'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            トップページに戻る
          </a>
        </p>
      </div>
    </div>
  )
}

