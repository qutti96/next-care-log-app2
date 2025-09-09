// Server Component（'use client'削除）
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新規アカウント作成
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントを作成してください
          </p>
        </div>
        
        <SignUpForm
          // onSuccess={(user) => console.log('SignUp successful:', user.email)}
          // onError={(error) => console.error('SignUp failed:', error)}
        />
        
        <div className="text-center">
          <a
            href="/users/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            既にアカウントをお持ちの方はこちら
          </a>
        </div>
      </div>
    </div>
  )
}
