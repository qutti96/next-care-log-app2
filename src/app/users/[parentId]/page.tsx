// ユーザープロフィール表示ページ

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserProfile } from '@/lib/actions/profile'
import { ProfileDisplay } from '@/components/profile/profile-display'

interface ProfilePageProps {
  params: { parentId: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerSupabase()

  try {
    // 🔐 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect('/users/login')
    }

    // 🚀 権限チェック：自分のプロフィールのみ閲覧可能
    if (user.id !== params.parentId) {
      redirect('/unauthorized')
    }

    // 📊 既存のServer Actionを活用してプロフィールデータ取得
    const result = await getUserProfile(user.id)

    if (!result.success || !result.data) {
      // プロフィールが存在しない場合は作成画面へ
      redirect(`/users/${user.id}/create`)
    }

    const profile = result.data

    return (
      <ProfileDisplay 
        parentId={user.id}
        userEmail={user.email!}
        profile={profile}
      />
    )

  } catch (error) {
    console.error('💥 ProfilePage: Unexpected error:', error)
    redirect('/users/login')
  }
}