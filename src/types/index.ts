// src/types/index.ts
/**
 * アプリケーション全体で使用する型定義
 * Supabaseベースの完全独立型定義（外部依存なし）
 */

// ユーザーロール定義
export const USER_ROLES = {
  PARENT: 'parent',
  STAFF: 'staff',
  MANAGER: 'manager',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// === 基本エンティティ型定義（Supabaseテーブル構造準拠・snake_case）===
/**
 * ユーザー（保護者）の基本型
 * Supabase: profiles テーブル
 */
export interface User {
  id: string;
  email: string;
  name: string;
  name_kana?: string | null;
  tel?: string | null;
  last_name?: string | null;
  last_name_kana?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * 子どもの基本型
 * Supabase: children テーブル（snake_case）
 * 重要: Supabaseから取得するデータの実際の構造に合わせています
 */
export interface Child {
  id: string;
  parent_id: string;                    // Prisma時代: parentId
  name: string;
  name_kana?: string | null;            // Prisma時代: nameKana
  birthday: string;                     // YYYY-MM-DD形式
  class_id?: string | null;             // Prisma時代: classId
  allergens?: string | null;
  milk_amount?: string | null;          // Supabaseでは文字列型
  milk_interval?: string | null;        // Supabaseでは文字列型
  photo_url?: string | null;            // Prisma時代: photoUrl
  created_at: string;                   // Prisma時代: createdAt
  updated_at: string;                   // Prisma時代: updatedAt
  deleted_at?: string | null;           // Prisma時代: deletedAt
}

/**
 * クラスの基本型
 * Supabase: classes テーブル
 */
export interface Class {
  id: string;
  name: string;
  facility_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * 施設の基本型
 * Supabase: facilities テーブル
 */
export interface Facility {
  id: string;
  name: string;
  address?: string | null;
  tel?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}


// === 認証関連の型定義 ===
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

// === フォーム用の型定義（camelCase・フロントエンド向け） ===
/**
 * 子どもプロフィールフォーム用データ型
 * 注意: フォームではcamelCase、数値型を使用
 * Server Actionでsnake_case + 文字列型に変換
 */
export interface ChildFormData {
  name: string;
  nameKana?: string;                    // DB: name_kana
  birthday: string;                     // YYYY-MM-DD形式
  classId?: string | null;              // DB: class_id
  allergens?: string;
  milkAmount?: number | null;           // DB: milk_amount (string)
  milkInterval?: number | null;         // DB: milk_interval (string)
  photoUrl?: string;                    // DB: photo_url
}

/**
 * 投稿フォーム用データ型
 * 注意: フォームではcamelCase、数値型を使用
 * Server Actionでsnake_case + 文字列型に変換
 */
export interface PostFormData {
  childId: string;
  postDay: string; // HTMLフォームでは文字列
  pickUpPerson?: string;
  temperature?: string;
  messages?: string;
  medicationRequired: boolean;
  typeOfMedication?: string;
  timingOfMedication?: string;
}

// === API レスポンス用の型定義 ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// === リレーションを含む型定義 ===
/**
 * 施設情報を含むクラス型
 */
export interface ClassWithFacility extends Class {
  facility?: Facility | null;
}

/**
 * クラス情報を含む子ども型
 * Supabaseの結合クエリ結果に対応
 */
export interface ChildWithClass extends Child {
  class?: ClassWithFacility | null;
  parent?: User | null;
}

/**
 * 子ども一覧を含むユーザー型
 */
export interface UserWithChildren extends User {
  children: ChildWithClass[];
}

// export interface PostWithRelations extends Post {
//   child: ChildWithClass;
//   parent: User;
//   log?: LogWithEvents;
// }

// export interface LogWithEvents extends Log {
//   events: Event[];
//   post?: PostWithRelations;
// }

//  === 子どもの月齢の型定義 ===
export interface ChildAgeInfo {
  years: number;
  months: number;
  totalMonths: number;
  displayText: string;
  isInfant: boolean;
  isToddler: boolean;
}

/**
 * 年齢情報を含む子ども型（表示用）
 * ChildWithClass を拡張して年齢情報を追加
 */
export interface ChildWithAge extends ChildWithClass {
  age: ChildAgeInfo;
}

// === ドロップダウン用の型定義 ===
export interface SelectOption {
  id: string;
  name: string;
}

export type ClassOption = SelectOption
export type FacilityOption = SelectOption

// === 検索・フィルタリング用の型定義 ===
export interface ChildSearchParams {
  name?: string;
  classId?: string;
  parentId?: string;
  page?: number;
  limit?: number;
}

export interface PostSearchParams {
  childId?: string;
  parentId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// === 状態管理用の型定義 ===
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState<T> extends LoadingState {
  data?: T;
  isDirty: boolean;
  isValid: boolean;
}

// === 通知・アラート用の型定義 ===
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// === ファイルアップロード用の型定義 ===
export interface FileUploadData {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// === 統計・レポート用の型定義 ===
export interface AttendanceStats {
  totalChildren: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

export interface ClassStats {
  classId: string;
  className: string;
  totalChildren: number;
  presentToday: number;
  staffCount: number;
}

//  === 子ども作成用データ型（parentId付き） ===
export interface ChildCreateData extends ChildFormData {
  parentId: string;
}

//  === 子ども更新用データ型（部分更新対応） ===
export type ChildUpdateData = Partial<ChildFormData>;

// 子ども情報更新用の型（部分更新対応）
export type UpdateChildInput = Partial<Omit<ChildFormData, 'birthday'>> & {
  birthday?: string; // 更新時もstring型で受け取り、サービス層でDate変換
};

// === エラーハンドリング用 ===

/**
 * 子どもエラーハンドリング統一用
 */
export class ChildServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ChildServiceError';
  }
}
