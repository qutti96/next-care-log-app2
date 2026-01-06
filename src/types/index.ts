// ユーザーロール定義
export const USER_ROLES = {
  PARENT: 'parent',
  STAFF: 'staff',
  MANAGER: 'manager',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Prismaの生成型をインポート（これが新しい基盤）
import {
  User,
  Child,
  Facility,
  Class,
   // 以下は将来の機能実装時に有効化
//  Manager,
//  Staff,
//  Post,
//  Log,
//  Event
} from '@prisma/client';

// 追加の共通型定義
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

// === フォーム用の型定義 ===
// （データベース型とは異なる形でフォーム入力を表現）
export interface ChildFormData {
  name: string;
  nameKana?: string;
  birthday: string; // HTMLフォームでは文字列
  classId?: string | null;
  allergens?: string;
  milkAmount?: number | null;   // INTEGER型
  milkInterval?: number | null; // DECIMAL型
  photoUrl?: string;
}

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

// === Prismaの型を拡張・結合した型定義 ===
// （includeオプションで取得される関連データの型）
export interface ClassWithFacility extends Class {
  facility: Facility;
}
export interface ChildWithClass extends Child {
  class?: ClassWithFacility | null;  // ✅ nullable対応
  parent?: User;
}
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

// ✅ 修正2: ChildWithAge を明確に定義（重複解消）
export interface ChildWithAge {
  id: string;
  name: string;
  nameKana: string | null;
  birthday: string; // APIレスポンスでは文字列
  age: ChildAgeInfo;
  
  // クラス情報（任意）
  classId: string | null;
  className: string | null;
  
  // 数値型フィールド
  milkAmount: number | null;
  milkInterval: number | null;
  
  allergens: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
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

// 子どもエラーハンドリング統一用（オプション）
export class ChildServiceError extends Error {
  constructor(message: string, public code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ChildServiceError';
  }
}
