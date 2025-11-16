'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'

interface SignUpFormProps {
  className?: string
}

export default function SignUpForm({
  className = '',
}: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = getBrowserSupabase()
  const router = useRouter()

  // usersテーブルへの安全な挿入関数
  const ensureUserRow = async (user: User, name: string) => {
    try {
      console.log('📝 usersテーブル作成開始', {
        userId: user.id,
        name: name,
        email: user.email
    })

    // 現在の認証状態を詳細確認
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    console.log('🔐 認証状態詳細:', {
      isAuthenticated: !!currentUser,
      currentUserId: currentUser?.id,
      targetUserId: user.id,
      idsMatch: currentUser?.id === user.id,
      sessionExists: !!currentUser
    })

    // 権限テスト：単純なSELECTクエリで接続確認
    const { error: testError } = await supabase
    .from('users')
    .select('id')
    .limit(1)

    console.log('🧪 接続テスト結果:', {
      success: !testError,
      testError: testError?.message
    })

    const now = new Date().toISOString()
    console.log('⏰ タイムスタンプ生成:', now)
    const upsertData = {
      id: user.id,
      email: user.email!,
      name: name,
      // password: null, Supabaseで管理しているから
      name_kana: null,
      tel: null,
      photo_url: null,
      created_at: now,    // 追加
      updated_at: now,    // 追加
    }

    console.log('📤 送信データ:', upsertData)
    console.log('🚀 upsert実行開始...')

    const { data: upsertResult, error: upsertError } = await supabase
      .from('users')
      .upsert(upsertData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()

      console.log('📥 upsert実行完了:', {
        success: !upsertError,
        data: upsertResult,
        error: upsertError?.message,
        errorCode: upsertError?.code
      })

      if (upsertError) {
        console.error('❌ upsertエラー詳細:', {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code
        })
        throw new Error(`プロフィール作成に失敗: ${upsertError.message}`)
      }
      console.log('✅ usersテーブル作成成功:', upsertResult)
      return upsertResult
  
    } catch (err) {
      console.error('❌ ensureUserRow完全エラー:', {
        error: err,
        message: err instanceof Error ? err.message : String(err)
      })
      throw err
    }

      // const { error: upsertError } = await supabase
      //   .from('users')
      //   .upsert(
      //     {
      //       id: user.id,              // AuthのUIDを直接使用
      //       email: user.email!,
      //       name: name,               // フォームから取得した名前
      //       password: null,           // Supabase Authが管理
      //       name_kana: null,         // プロフィール登録で後から更新
      //       tel: null,               // プロフィール登録で後から更新
      //       photo_url: null,         // プロフィール登録で後から更新
      //     },
      //     {
      //       onConflict: 'id',        // 重複時は更新
      //       ignoreDuplicates: false  // 重複時も更新を実行
      //     }
      //   )

    //   if (upsertError) {
    //     throw new Error(`プロフィール作成に失敗しました: ${upsertError.message}`)
    //   }
    //   console.log('✅ usersテーブル作成成功:', user.id)
    // } catch (err) {
    //   console.error('❌ ensureUserRow error:', err)
    //   throw err
    // }

  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      console.log('🚀 サインアップ開始 - ロール:', 'parent')

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'parent'
          },
          emailRedirectTo: `${location.origin}/auth/callback`
        }
      })

      if (authError) {
        setError(authError.message)
        console.error('❌ Sign up error:', authError)
        return
      }

      if (data.user) {
        setMessage('サインアップに成功しました！確認メールをチェックしてください。')
        console.log('✅ Auth user created:', data.user.email)

        // 2. セッション状態による分岐処理
  //       if (data.session) {
  //         // 即座にログイン状態の場合（メール確認不要）
  //         console.log('📧 即座ログイン - usersテーブル作成中...')
  //         await ensureUserRow(data.user, formData.name)
  //         console.log('✅ 即座ログイン完了 - プロフィール登録へ')
  //         router.push(`/users/${data.user.id}/create`)
  //         return
  //       } else {
  //         // メール確認が必要な場合
  //         console.log('📧 メール確認必要 - 確認メール送信済み')
  //         setMessage(
  //           'サインアップに成功しました！\n' +
  //           '確認メールをチェックして、リンクをクリックしてください。\n' +
  //           'ログイン後、自動的にプロフィール登録画面に移動します。'
  //         )
  //       }
  //     }

  //   } catch (err: unknown) {
  //     const message = err instanceof Error ? err.message : String(err)
  //     setError('予期せぬエラーが発生しました: ' + message)
  //     console.error('❌ Unexpected error:', err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }


     // 多段階アプローチで確実にusersテーブル作成
      // 1) 即座のgetUserでフォールバック
      const { data: immediateUser } = await supabase.auth.getUser()
      if (immediateUser?.user) {
        console.log('🔐 getUser直後にログイン検出 → upsert実行')
        try {
          await ensureUserRow(immediateUser.user, formData.name)
          console.log('✅ 即座ログイン完了 - プロフィール登録へ')
          router.replace(`/users/${immediateUser.user.id}/create`) // replaceで履歴に残さない
          return
        } catch (ensureError) {
          console.error('❌ 即座upsert失敗:', ensureError)
          // フォールバックに進む
        }
      }

      // 2) セッションイベントを待ち受け
      let hasRedirected = false
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('📡 auth state change:', event)
        if (event === 'SIGNED_IN' && session?.user && !hasRedirected) {
          hasRedirected = true
          try {
            await ensureUserRow(session.user, formData.name)
            console.log('✅ セッションイベント経由でupsert成功')
            router.replace(`/users/${session.user.id}/create`)
          } catch (ensureError) {
            console.error('❌ セッションイベント経由upsert失敗:', ensureError)
            setError(`ユーザー登録処理でエラーが発生しました: ${ensureError instanceof Error ? ensureError.message : String(ensureError)}`)
          } finally {
            listener.subscription.unsubscribe()
          }
        }
      })

      // 3) 安全弁：5秒待っても遷移しない場合は手動確認
      setTimeout(async () => {
        if (!hasRedirected) {
          const { data: fallbackUser } = await supabase.auth.getUser()
          if (fallbackUser?.user) {
            console.log('⏱ フォールバック発火 → upsert実行')
            try {
              await ensureUserRow(fallbackUser.user, formData.name)
              router.replace(`/users/${fallbackUser.user.id}/create`)
            } catch (ensureError) {
              console.error('❌ フォールバックupsert失敗:', ensureError)
              setError(`ユーザー登録処理でエラーが発生しました: ${ensureError instanceof Error ? ensureError.message : String(ensureError)}`)
            }
          } else {
            setMessage('サインアップは成功しましたが、セッション確立に時間がかかっています。少し待ってから再度お試しください。')
          }
          setLoading(false)
          listener.subscription.unsubscribe()
        }
      }, 5000)
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    setError('予期せぬエラーが発生しました: ' + message)
    console.error('❌ Unexpected error:', err)
  } finally {
    // ローディング状態は成功時のリダイレクトまたはタイムアウトで解除
  }
}



  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          お名前
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
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
          minLength={6}
        />
        <p className="mt-1 text-sm text-gray-500">6文字以上で入力してください</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            アカウント作成中...
          </div>
        ) : (
          'アカウント作成'
        )}
      </button>
      
      {message && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </form>
  )
}
