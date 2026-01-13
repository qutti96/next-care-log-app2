// lib/validations/child-profile.ts
import * as z from 'zod';

/**
 * 子どもプロフィールバリデーションスキーマ
 * 保護者プロフィール（profile.ts）との整合性を重視
 */
export const childProfileFormSchema = z.object({
  // 基本情報（必須）
  name: z
  .string()
  .min(1, '名前は必須です 入力してください')
  .max(50, '名前は50文字以内で入力してください'),

  nameKana: z
  .string()
  .max(50, 'ふりがなは50文字以内で入力してください')
  .optional()
  .or(z.literal('')), // 空文字も許容

  // 🔥 string型（YYYY-MM-DD）として完全統一
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
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      { message: '生年月日は今日以前の日付を入力してください' }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 10);
        return date >= minDate;
      },
      { message: '対象年齢は10歳以下のお子さまです' }
    ),

  // クラス情報（要件に合わせて任意に変更）
  classId: z
  .string()
  .optional()
  .nullable()
  .or(z.literal('')), // 未所属の子どもも対応

  // アレルギー情報（任意）
  allergens: z
  .string()
  .max(200, 'アレルギー情報は200文字以内で入力してください')
  .optional()
  .or(z.literal('')),

  milkAmount: z
  .number()
  .int('ミルク量は整数で入力してください')
  .min(1, 'ミルク量は1ml以上で入力してください')
  .max(500, 'ミルク量は500ml以下で入力してください')
  .nullable()
  .optional(),

  milkInterval: z
  .number()
  .min(0.5, 'ミルク間隔は0.5時間以上で入力してください')
  .max(24, 'ミルク間隔は24時間以内で入力してください')
  .nullable()
  .optional(),

// 写真URL（任意）
  photoUrl: z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val === '') return true; // 空文字は許可
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: '有効なURLを入力してください' }
  )
  .or(z.literal('')),
});

/**
 * Server Actions用の型定義
 */
export type ChildProfileActionInput = {
  parentId: string;
  childId?: string;
} & ChildProfileFormValues;


// 🔥 重要: 型定義の完全エクスポート
// 🔥 新規追加: Server Actionとの完全互換性
export type ChildProfileFormValues = z.infer<typeof childProfileFormSchema>;
export type ChildFormData = ChildProfileFormValues;
// 更新用スキーマ（部分更新対応）
export const updateChildProfileSchema = childProfileFormSchema.partial();
export type UpdateChildProfileValues = z.infer<typeof updateChildProfileSchema>;


//🔄 既存コード互換性 & 新規実装のためのエクスポート
// 新規実装用のメインスキーマ名
export const childProfileSchema = childProfileFormSchema;
// 既存コード互換用エクスポート
export const childFormSchema = childProfileFormSchema;
export type ChildFormValues = ChildProfileFormValues;
export const updateChildSchema = updateChildProfileSchema;
// 保護者プロフィール機能との互換性用
export type ParentChildFormValues = ChildFormValues;
export const parentChildFormSchema = childFormSchema;

