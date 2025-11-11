import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CompletePageProps {
  params: { id: string };
}

export default async function CompletePage({ params }: CompletePageProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-8">
      <div className="container max-w-md mx-auto px-4">
        <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              登録完了
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              プロフィールの登録が完了しました。<br />
              続けてお子さまの詳細情報を登録しましょう。
            </p>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href={`/users/${params.id}/children/create`}>
                  子どもプロフィール登録へ
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href={`/users/${params.id}`}>
                  プロフィール確認
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
