//ProfileForm統合コンポーネント実装
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserProfileFormInput, userProfileFormSchema } from '@/lib/validations/profile';
import { ImageUpload } from '@/components/ui/image-upload';
import { ChildrenFields } from '@/components/profile/children-fields';
import { upsertUserProfile } from '@/lib/actions/profile';

interface ProfileFormProps {
  userId: string;
  userEmail: string;
  initialData?: Partial<UserProfileFormInput>;
  mode: 'create' | 'edit';
}

export function ProfileForm({ userId, userEmail, initialData, mode }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserProfileFormInput>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      nameKana: initialData?.nameKana || '',
      tel: initialData?.tel || '',
      photoUrl: initialData?.photoUrl || '',
      children: initialData?.children && initialData.children.length > 0
        ? initialData.children
        : [], //🚀 修正：空配列に変更（ChildrenFieldsが初期化を担当）
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: UserProfileFormInput) => {
    try {
      setIsLoading(true);
      
      const result = await upsertUserProfile(userId, data);
      
      if (result.success) {
        toast({
          title: mode === 'create'
            ? 'プロフィールを登録しました'
            : 'プロフィールを更新しました'
        });
        //🚀 修正：モード別の遷移制御
        if (mode === 'create') {
          router.push(`/users/${userId}/complete`);
        } else {
        // 編集の場合は現在のページをリフレッシュしてAuthContextを更新
        router.refresh();
        }
      } else {
        toast({
          title: 'エラー',
          description: result.error || '処理に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    toast({
      title: '入力内容をリセットしました'
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {mode === 'create' ? 'プロフィール登録' : 'プロフィール編集'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {mode === 'create'
                ? '保護者様の基本情報とお子さまの情報を入力してください'
                : 'プロフィール情報を更新できます'
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* プロフィール画像 */}
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>プロフィール画像</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          userId={userId}
                          bucketName="profiles"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 基本情報フィールド群 */}
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          氏名 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="山田太郎" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameKana"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>氏名（カナ）</FormLabel>
                        <FormControl>
                          <Input placeholder="ヤマダタロウ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>電話番号</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="090-1234-5678" 
                            type="tel"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>メールアドレス</FormLabel>
                    <Input value={userEmail} disabled className="bg-gray-100" />
                    <p className="text-sm text-gray-500 mt-1">
                      メールアドレスは変更できません
                    </p>
                  </div>
                </div>

                {/* 子ども情報 */}
                <ChildrenFields form={form} />

                {/* アクションボタン */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading ||(mode === 'edit' && !form.formState.isDirty)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? '登録する' : '更新する'}
                  </Button>

                  {mode === 'create' ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      リセット
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
