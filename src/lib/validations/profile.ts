// src/lib/validations/profile.ts
import { z } from 'zod'

// 国際化対応の名前バリデーション（日本語 + アルファベット）
const nameRegex = /^[ぁ-んァ-ヶー一-龯a-zA-Z\s\-']+$/
const kanaRegex = /^[ァ-ヶー\s]*$/
const phoneRegex = /^[0-9+\-()\s]*$/

/**
 * 子どもフォーム用スキーマ
 * 動的配列フィールド対応
 */
export const childFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, '子どもの氏名は必須です')
    .max(50, '氏名は50文字以内で入力してください')
    .regex(nameRegex, 'ひらがな、カタカナ、漢字、アルファベットで入力してください'),
  tempId: z.string().optional(), // フォーム内一意識別用
})

/**
 * 保護者プロフィールフォーム用スキーマ
 * React Hook Form + Server Actions統一対応
 */
export const userProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '氏名は必須です')
    .max(50, '氏名は50文字以内で入力してください')
    .regex(nameRegex, 'ひらがな、カタカナ、漢字、アルファベットで入力してください'),
  
  nameKana: z
    .string()
    .trim()
    .max(50, 'カナ氏名は50文字以内で入力してください')
    .regex(kanaRegex, 'カタカナで入力してください')
    .optional()
    .or(z.literal('')),
  
  tel: z
    .string()
    .trim()
    .regex(phoneRegex, '正しい電話番号形式で入力してください')
    .min(10, '電話番号は10文字以上で入力してください')
    .max(15, '電話番号は15文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  // 非公開バケット運用: storage pathを保存（例: userId/timestamp.webp）
  photoUrl: z
    .string()
    .optional()
    .or(z.literal('')),
  
  children: z
    .array(childFormSchema)
    .min(1, '最低1人のお子さまの登録が必要です')
    .max(5, 'お子さまの登録は5人までです'),
})

/**
 * Server Actions用バリデーションスキーマ
 * FormDataからの変換を考慮
 */
export const serverProfileSchema = userProfileFormSchema.extend({
  children: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
  })),
})

// 型推論のためのエクスポート
export type UserProfileFormInput = z.infer<typeof userProfileFormSchema>
export type ServerProfileInput = z.infer<typeof serverProfileSchema>
