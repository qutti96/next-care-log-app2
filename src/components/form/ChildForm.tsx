import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  childFormSchema,
  type ChildFormValues
} from '@/lib/validations/child-profile';

interface ChildFormProps {
  onSubmit: (values: ChildFormValues) => void;
  defaultValues?: Partial<ChildFormValues>;//編集モード対応
}

export function ChildForm({ onSubmit, defaultValues }: ChildFormProps) {
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    // 🔑 重要: すべてのスキーマフィールドに対応する初期値を設定
    defaultValues: {
      name: defaultValues?.name || '',
      nameKana: defaultValues?.nameKana || '',
      birthday: defaultValues?.birthday || '',
      classId: defaultValues?.classId || '',
      allergens: defaultValues?.allergens || '',
      milkAmount: defaultValues?.milkAmount ?? null,
      milkInterval: defaultValues?.milkInterval ?? null,
      photoUrl: defaultValues?.photoUrl || '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

      {/* クラスID（必須 - 既存API仕様に準拠） */}
      <div>
        <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
          所属クラス <span className="text-red-500">*</span>
        </label>
        <select
        id="classId"
        {...form.register('classId')}
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
  >
        {/* ✅ 未所属選択肢を追加 */}
        <option value="">クラス未所属</option>
        <option value="class_0">0歳児クラス</option>
        <option value="class_1">1歳児クラス</option>
        <option value="class_2">2歳児クラス</option>
        <option value="class_3">3歳児クラス</option>
        <option value="class_4">4歳児クラス</option>
        <option value="class_5">5歳児クラス</option>
      </select>
      {form.formState.errors.classId && (
        <p className="mt-1 text-sm text-red-500">
          {form.formState.errors.classId.message}
        </p>
      )}
    </div>

      {/* アレルギー情報（任意） */}
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

      {/* ミルク情報（数値入力 + valueAsNumber */}
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
            {...form.register('milkAmount',{valueAsNumber: true})} // valueAsNumberは不要（preprocessが処理）
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
            {...form.register('milkInterval',{valueAsNumber: true})}
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

      {/* 写真URL（任意） */}
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
          disabled={form.formState.isSubmitting}
          className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {form.formState.isSubmitting ? '登録中...' : '登録'}
        </button>
      </div>
    </form>
  );
}