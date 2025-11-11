// lib/validations/child.ts
import * as z from 'zod';

export const childFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  nameKana: z.string().max(50, 'ふりがなは50文字以内で入力してください').optional(),
  birthday: z
    .string()
    .min(1, '生年月日は必須です')
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: '有効な日付を入力してください' }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        const today = new Date();
        return date <= today;
      },
      { message: '生年月日は今日以前の日付を入力してください' }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 10); // 10歳以下の制限
        return date >= minDate;
      },
      { message: '生年月日は10年以内の日付を入力してください' }
    ),
  classId: z.string().min(1, '所属クラスは必須です'),
  allergens: z.string().max(200, 'アレルギー情報は200文字以内で入力してください').optional(),
  milkAmount: z.string().max(50, 'ミルクの量は50文字以内で入力してください').optional(),
  milkInterval: z.string().max(50, 'ミルクの間隔は50文字以内で入力してください').optional(),
  photoUrl: z.string().url({ message: '有効なURLを入力してください' }).optional().or(z.literal('')),
});

export type ChildFormValues = z.infer<typeof childFormSchema>;
// 既存のchildFormSchemaに加えて
export const updateChildSchema = childFormSchema.partial(); // 全フィールドをオプショナルに

// 保護者プロフィール機能との互換性用エクスポート
export type ParentChildFormValues = ChildFormValues
export const parentChildFormSchema = childFormSchema