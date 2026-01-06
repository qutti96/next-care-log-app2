// src/lib/validations/profile.ts
import { z } from 'zod'
import { childFormSchema } from './child-profile' // 詳細な子どもスキーマをインポート

// 国際化対応の名前バリデーション（日本語 + アルファベット）
const nameRegex = /^[ぁ-んァ-ヶー一-龯a-zA-Z\s\-']+$/
const kanaRegex = /^[ァ-ヶー\s]*$/
// const phoneRegex = /^[0-9+\-()\s]*$/


/**
 * 保護者プロフィールフォーム用スキーマ
 * React Hook Form + Server Actions統一対応
 * 子どもの詳細情報は child.ts から取得
 */
export const parentProfileFormSchema = z.object({
  id: z.string()
    .refine(
      (val) => {
        if (!val) return true; // optionalなので空は許可
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(val);
      },
      { message: '有効なUUID形式で入力してください' }
    )
    .optional(),
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
    .optional()
    .refine((val) => {
      // 空文字は許可（任意フィールド）
      if (!val) return true

      // 許可する文字: 数字、ハイフン、括弧、スペース、プラス記号
      const phoneRegex = /^[0-9+\-()\s]+$/
      if (!phoneRegex.test(val)) return false

      // 数字のみ抽出して桁数チェック（日本の電話番号形式）
      const digitsOnly = val.replace(/[^0-9]/g, '')
      return digitsOnly.length >= 10 && digitsOnly.length <= 11
    }, '正しい電話番号形式で入力してください（例: 090-1234-5678）')
    .or(z.literal('')),

    // 非公開バケット運用: storage pathを保存（例: userId/timestamp.webp）
  photoUrl: z
    .string()
    .optional()
    .or(z.literal('')),

  // 重要：child-profile.ts の詳細なchildFormSchemaを使用
  children: z
    .array(childFormSchema.extend({
      id: z.string()
        .refine(
          (val) => {
            if (!val) return true; // optionalなので空は許可
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(val);
          },
          { message: '有効なUUID形式で入力してください' }
        )
        .optional(),
      // フォーム内での一時識別子（useFieldArrayで使用）
      tempId: z.string().optional(),
      // 保護者プロフィール内では一部フィールドを任意に
      birthday: childFormSchema.shape.birthday.optional(),
      classId: childFormSchema.shape.classId.optional(),
    }))
    .min(1, '最低1人のお子さまの登録が必要です')
    .max(6, 'お子さまの登録は6人までです'),
})

/**
 * Server Actions用スキーマ
 */
export const serverParentProfileSchema = parentProfileFormSchema

// 型推論のためのエクスポート
export type ParentProfileFormValues = z.infer<typeof parentProfileFormSchema>
export type ServerParentProfileInput = z.infer<typeof serverParentProfileSchema>
// 既存コードとの互換性のためのエイリアス
export const userProfileFormSchema = parentProfileFormSchema
export type UserProfileFormInput = ParentProfileFormValues
export type ServerProfileInput = ServerParentProfileInput