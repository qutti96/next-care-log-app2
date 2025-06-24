import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function TestSupabasePage() {
  let data = null
  let error = null

  try {
    const result = await supabase
      .from('test_connection')
      .select('*')
      .order('created_at', { ascending: false })
    
    data = result.data
    error = result.error
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Supabase接続テスト</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">エラー！</strong>
            <p className="mt-2">{error.message}</p>
            <p className="text-sm mt-2">`.env.local`のSupabaseキーを確認してください。</p>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong className="font-bold">接続成功！</strong>
            <p className="mt-2">Supabaseとの連携が完了しました。</p>
            <pre className="mt-4 p-2 bg-green-50 rounded text-left text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}