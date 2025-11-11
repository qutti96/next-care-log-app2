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
  console.log('🔍 CreateProfilePage: Starting for user ID:', params.id)
  const supabase = createServerSupabase();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('🔍 CreateProfilePage: Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      paramId: params.id,
      error: error?.message,
    })

    if (error) {
      console.error('❌ CreateProfilePage: Auth error:', error.message)
      redirect('/users/login')
    }
    
    if (!user) {
      console.log('❌ CreateProfilePage: No user found, redirecting to login')
      redirect('/users/login')
    }

    if (user.id !== params.id) {
      console.warn('⚠️ CreateProfilePage: User ID mismatch!', { 
        authUserId: user.id, 
        paramId: params.id 
      })
      redirect('/users/login')
    }

    console.log('✅ CreateProfilePage: User authenticated successfully:', user.id)

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
