import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { ProfileForm } from '@/components/profile/profile-form';
import { getUserProfile } from '@/lib/actions/profile';

interface EditProfilePageProps {
  params: { id: string };
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const supabase = createServerSupabase();

  // 認証確認
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/users/login');
  }

  // 権限確認
  if (user.id !== params.id) {
    redirect('/unauthorized');
  }

  // 既存データ取得
  const profileResult = await getUserProfile(params.id);
  if (!profileResult.success) {
    redirect(`/users/${params.id}/create`);
  }

  const profile = profileResult.data!;
  const initialData = {
    name: profile.name,
    nameKana: profile.nameKana || '',
    tel: profile.tel || '',
    photoUrl: profile.photoUrl || '',
    children: profile.children.map((child: { id: string; name: string }) => ({
      id: child.id,
      name: child.name,
      tempId: undefined,
    })),
  };

  return (
    <ProfileForm 
      userId={user.id}
      userEmail={user.email!}
      initialData={initialData}
      mode="edit"
    />
  );
}
