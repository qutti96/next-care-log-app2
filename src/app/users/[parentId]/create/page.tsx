// app/users/[parentId]/create/page.tsx
// 保護者プロフィール作成ページ

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { ProfileForm } from '@/components/profile/profile-form';

interface CreateProfilePageProps {
  params: { parentId: string };
}

export default async function CreateProfilePage({ params }: CreateProfilePageProps) {
  // 🚀 修正1: 開発環境限定ログ
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 CreateProfilePage: Starting for user ID:', params.parentId)
  }

  const supabase = createServerSupabase();

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 CreateProfilePage: Auth check:', {
        hasUser: !!user,
        userId: user?.id,
        paramId: params.parentId,
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
    if (user.id !== params.parentId) {
      console.warn('⚠️ CreateProfilePage: User ID mismatch!', {
        authUserId: user.id,
        paramId: params.parentId
      })
      // 🚀 修正2: 権限エラー時は/unauthorizedへ
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 CreateProfilePage: Redirecting to /unauthorized')
      }
      redirect('/unauthorized')
    }

    // 🚀 改善: 保護者情報と子ども情報を効率的に同時取得
    const [profileResult, childrenResult] = await Promise.all([
      supabase
        .from('users')
        .select('name, name_kana, tel, photo_url')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .is('deleted_at', null)
    ])

    const { data: existingProfile, error: profileError } = profileResult
    const { data: children, error: childrenError } = childrenResult

    if (profileError) {
      console.error('❌ CreateProfilePage: Profile fetch error:', profileError.message)
      // プロフィール取得エラー時はログイン画面へ（安全策）
      redirect('/users/login')
    }

    if (childrenError) {
      console.error('❌ CreateProfilePage: Children fetch error:', childrenError.message)
      // 子ども情報取得エラーは致命的ではないため、作成画面を表示
    }

    // 🚀 改善: 業務ロジックに基づいた完成判定
    const hasBasicInfo = !!existingProfile?.name
    const hasOptionalFields = !!(
      existingProfile?.name_kana || 
      existingProfile?.tel || 
      existingProfile?.photo_url
    )
    const hasChildren = (children?.length ?? 0) > 0

 // 保育園アプリでは「基本情報 + 子ども情報」が揃って初めて完成
  const isProfileComplete = hasBasicInfo && hasOptionalFields && hasChildren

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 CreateProfilePage: Profile completion status:', {
      hasBasicInfo,
      hasOptionalFields,
      hasChildren,
      childrenCount: children?.length ?? 0,
      isProfileComplete
    })
  }

  if (isProfileComplete) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ CreateProfilePage: Profile complete, redirecting to edit')
    }
    redirect(`/users/${user.id}/edit`)
  }

    // 🚀 重要: 既存のプロフィールデータを初期値として準備
    const initialData = existingProfile ? {
      name: existingProfile.name || '',
      nameKana: existingProfile.name_kana || '',
      tel: existingProfile.tel || '',
      photoUrl: existingProfile.photo_url || '',
      children: [] // 作成画面では空配列（これから追加するため）
    } : undefined

    if (process.env.NODE_ENV === 'development') {
      console.log('📝 CreateProfilePage: Initial data prepared:', initialData)
    }

    return (
      <ProfileForm
        parentId={user.id}
        userEmail={user.email!}
        initialData={initialData}
        mode="create"
      />
    )
  } catch (error) {
    console.error('💥 CreateProfilePage: Unexpected error:', error)
    redirect('/users/login')
  }
}
