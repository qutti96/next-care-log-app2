'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  childFormSchema,
  type ChildFormData
} from '@/lib/validations/child-profile';
import { upsertChildProfile } from '@/lib/actions/child-profile';

interface ChildFormProps {
  // 🔥 修正: 登録ページから渡されるPropsに完全一致
  parentId: string;
  defaultValues?: Partial<ChildFormData>;
  classOptions: Array<{ value: string; label: string }>;
  mode: 'create' | 'edit';
  childId?: string; // edit時のみ

}

export function ChildForm({ 
  parentId,
  defaultValues,
  classOptions,
  mode,
  childId
}: ChildFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    // 🔑 重要: すべてのスキーマフィールドに対応する初期値を設定
    defaultValues: {
      name: defaultValues?.name || '',
      nameKana: defaultValues?.nameKana || '',
      birthday: defaultValues?.birthday || '',// 🔥 修正: string型として扱う
      classId: defaultValues?.classId || '',
      allergens: defaultValues?.allergens || '',
      milkAmount: defaultValues?.milkAmount ?? null,
      milkInterval: defaultValues?.milkInterval ?? null,
      photoUrl: defaultValues?.photoUrl || '',
    },
  });

  const handleSubmit = async(data: ChildFormData) => {
    try {
      setIsSubmitting(true);

      const result = await upsertChildProfile({
        ...data,
        parentId,
        id: childId,
      });

      if (result.error) {
        
        toast({
          variant: "destructive",
          title: result.error,
        });
        
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as keyof ChildFormData, {
              message: errors[0],
            });
          });
        }
        return;
      }

      toast({
        title: mode === 'create'
          ? 'お子さまのプロフィールを登録しました！'
          : 'お子さまのプロフィールを更新しました！',
      });

      router.push(`/users/${parentId}/children/${result.data?.id}`);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'エラーが発生しました。もう一度お試しください。',
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* お名前（必須） */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...form.register('name')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="山田 太郎"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* ふりがな（任意） */}
      <div>
        <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700">
          ふりがな
        </label>
        <input
          id="nameKana"
          type="text"
          {...form.register('nameKana')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="やまだ たろう"
        />
        {form.formState.errors.nameKana && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.nameKana.message}
          </p>
        )}
      </div>

      {/* 生年月日（必須） */}
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
          生年月日 <span className="text-red-500">*</span>
        </label>
        <input
          id="birthday"
          type="date"
          {...form.register('birthday')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
        {form.formState.errors.birthday && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.birthday.message}
          </p>
        )}
      </div>

      {/* クラス選択 */}
      <div>
        <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
          所属クラス
        </label>
        <select
          id="classId"
          {...form.register('classId')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        >
          <option value="">クラス未所属</option>
          {classOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {form.formState.errors.classId && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.classId.message}
          </p>
        )}
      </div>

      {/* アレルギー情報 */}
      <div>
        <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">
          アレルギー情報
        </label>
        <textarea
          id="allergens"
          {...form.register('allergens')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="卵、乳製品、小麦など（複数ある場合はカンマ区切り）"
          rows={3}
        />
        {form.formState.errors.allergens && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.allergens.message}
          </p>
        )}
      </div>

      {/* ミルク情報 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="milkAmount" className="block text-sm font-medium text-gray-700">
            ミルク量（ml）
          </label>
          <input
            id="milkAmount"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            max="500"
            {...form.register('milkAmount', { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="120"
          />
          {form.formState.errors.milkAmount && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.milkAmount.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="milkInterval" className="block text-sm font-medium text-gray-700">
            ミルク間隔（時間）
          </label>
          <input
            id="milkInterval"
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0.5"
            max="24"
            {...form.register('milkInterval', { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="3.5"
          />
          {form.formState.errors.milkInterval && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.milkInterval.message}
            </p>
          )}
        </div>
      </div>

      {/* 写真URL */}
      <div>
        <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">
          写真URL
        </label>
        <input
          id="photoUrl"
          type="url"
          {...form.register('photoUrl')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="https://example.com/photo.jpg"
        />
        {form.formState.errors.photoUrl && (
          <p className="mt-1 text-sm text-red-500">
            {form.formState.errors.photoUrl.message}
          </p>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="pt-4">
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '送信中...' : mode === 'create' ? '登録' : '更新'}
        </button>
      </div>
    </form>
    );
}