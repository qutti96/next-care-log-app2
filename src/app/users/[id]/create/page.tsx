// app/users/[id]/create/page.tsx
// 保護者プロフィール作成ページ

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { ProfileForm } from '@/components/profile/profile-form';

interface CreateProfilePageProps {
  params: { id: string };
}

export default async function CreateProfilePage({ params }: CreateProfilePageProps) {
  // 🚀 修正1: 開発環境限定ログ
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 CreateProfilePage: Starting for user ID:', params.id)
  }

  const supabase = createServerSupabase();

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 CreateProfilePage: Auth check:', {
        hasUser: !!user,
        userId: user?.id,
        paramId: params.id,
        error: error?.message,
      })
    }

    // エラーまたはユーザーが存在しない場合はログインへ
    if (error || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ CreateProfilePage: Auth session missing, redirecting to login')
      }
      redirect('/users/login')
    }

    // 🚀 重要: 権限チェックを最初に実行（プロフィール取得前に）
    if (user.id !== params.id) {
      console.warn('⚠️ CreateProfilePage: User ID mismatch!', {
        authUserId: user.id,
        paramId: params.id
      })
      // 🚀 修正2: 権限エラー時は/unauthorizedへ
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 CreateProfilePage: Redirecting to /unauthorized')
      }
      redirect('/unauthorized')
    }

    // 🚀 修正3: 既存プロフィールチェック追加
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('name') // 🚀 パフォーマンス配慮：必要最小限のフィールド
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ CreateProfilePage: Profile fetch error:', profileError.message)
      // プロフィール取得エラー時はログイン画面へ（安全策）
      redirect('/users/login')
    }

    if (existingProfile?.name) {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ CreateProfilePage: Profile already exists, redirecting to edit')
      }
      redirect(`/users/${user.id}/edit`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ CreateProfilePage: User authenticated successfully:', user.id)
    }

    return (
      <ProfileForm
        userId={user.id}
        userEmail={user.email!}
        mode="create"
      />
    )
  } catch (error) {
    console.error('💥 CreateProfilePage: Unexpected error:', error)
    redirect('/users/login')
  }
}
