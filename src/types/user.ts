// src/types/user.ts（戦略的拡張版）

/**
 * メインのユーザープロフィール型
 * Prismaスキーマと完全互換、Supabase Auth統合対応
 */
export interface UserProfile {
  id: string                    // PK, UUID (Supabase Auth UID)
  name: string
  nameKana?: string | null      // DB互換性のためnull許容
  tel?: string | null           // DB互換性のためnull許容
  email: string                 // UNIQUE
  password?: string | null      // Supabase Authが管理、DBはnull許容
  photoUrl?: string | null      // DB互換性のためnull許容
  createdAt?: string           // TIMESTAMP (ISO string)
  updatedAt?: string           // TIMESTAMP (ISO string)
  deletedAt?: string | null    // ソフトデリート対応
  children: ChildProfile[]     // リレーション（既存との互換性維持）
}

/**
 * 子どもプロフィール型
 * Prismaスキーマ完全対応版
 */
export interface ChildProfile {
  id?: string                  // PK, UUID（新規作成時は未定義）
  parentId?: string            // FK → Users.id
  name: string                 // 必須フィールド（既存との互換性）
  nameKana?: string | null     // Prismaスキーマ対応
  birthday?: string | null     // DATE, nullable（段階的登録対応）
  classId?: string | null      // FK → Classes.id, nullable
  allergens?: string | null    // アレルギー情報
  milkAmount?: string | null   // ミルク量
  milkInterval?: string | null // ミルク間隔
  photoUrl?: string | null     // プロフィール画像
  createdAt?: string          // TIMESTAMP
  updatedAt?: string          // TIMESTAMP  
  deletedAt?: string | null   // ソフトデリート対応
}

/**
 * フォーム処理用の型定義
 */
export interface SignUpFormData {
  name: string
  email: string
  password: string
}

export interface ProfileFormData {
  name: string
  nameKana?: string
  tel?: string
  photoUrl?: string
  children: Array<{
    id?: string //既存の子どもの場合
    name: string
    tempId?: string; // フォーム用一時ID
  }>
}

/**
 * Server Actions用の更新型
 */
export interface UserProfileUpdate {
  name?: string
  nameKana?: string | null
  tel?: string | null
  photoUrl?: string | null
}

/**
 * データベース操作用のヘルパー型
 * upsert処理で必要なフィールドを明示
 */
export interface UserUpsertPayload {
  id: string
  email: string
  name: string
  name_kana?: string | null
  tel?: string | null
  photo_url?: string | null
  password?: string | null
  updated_at?: string
}

/**
 * 型変換ヘルパー関数
 * ドメイン型 → DB upsert payload
 */
export function userProfileToUpsertPayload(profile: UserProfile): UserUpsertPayload {
  const now = new Date().toISOString()
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    name_kana: profile.nameKana ?? null,
    tel: profile.tel ?? null,
    photo_url: profile.photoUrl ?? null,
    password: null, // Supabase Authが管理
    updated_at: now
  }
}

/**
 * 保護者プロフィールフォーム専用型
 * React Hook Form完全対応
 */
export interface UserProfileFormData {
  name: string
  nameKana?: string
  tel?: string
  photoUrl?: string  // 既存との互換性維持（storage pathとして使用）
  children: Array<{
    id?: string        // 既存の子どもの場合（編集時）
    name: string       // 必須フィールド
    tempId?: string    // フォーム内での一意識別用（新規追加時）
  }>
}

/**
 * Server Actions統一レスポンス型
 */
export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

