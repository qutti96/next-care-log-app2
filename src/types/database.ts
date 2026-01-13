// src/types/database.ts
/**
 * 共通型定義ファイル
 * Child関連の型定義は src/types/index.ts および src/lib/validations/child-profile.ts に移行済み
 */

// === 共通型定義（継続使用）===
// === API レスポンス用の型定義 ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === ドロップダウン用の型定義 ===
export interface ClassOption {
  id: string;
  name: string;
}

export interface FacilityOption {
  id: string;
  name: string;
}

// === 認証関連の型定義 ===
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'parent' | 'staff' | 'manager';
}

// === バリデーション用の型定義 ===
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

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
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
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
}

// 投稿（Post）フォーム用のデータ型
export interface PostFormData {
  childId: string;
  postDay: string; // フォームでは文字列として扱うことが多い
  pickUpPerson?: string;
  temperature?: string;
  messages?: string;
  medicationRequired: boolean;
  typeOfMedication?: string;
  timingOfMedication?: string;
}
// ログ（Log）フォーム用のデータ型
export interface LogFormData {
  postId: string;
  scenes?: string;
  photoUrl?: string;
  staff?: string;
}

// イベント（Event）フォーム用のデータ型
export interface EventFormData {
  logId: string;
  eventOccurrenceTime: string; // フォームでは文字列として扱うことが多い
  title: string;
  details?: string;
}
