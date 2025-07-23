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
  Manager,
  Staff,
  Post,
  Log,
  Event
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
  classId: string;
  allergens?: string;
  milkAmount?: string;
  milkInterval?: string;
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
export interface ChildWithClass extends Child {
  class: ClassWithFacility;
  parent?: User;
}

export interface ClassWithFacility extends Class {
  facility: Facility;
}

export interface UserWithChildren extends User {
  children: ChildWithClass[];
}

export interface PostWithRelations extends Post {
  child: ChildWithClass;
  parent: User;
  log?: LogWithEvents;
}

export interface LogWithEvents extends Log {
  events: Event[];
  post?: PostWithRelations;
}

// === ドロップダウン用の型定義 ===
export interface SelectOption {
  id: string;
  name: string;
}

export interface ClassOption extends SelectOption {}
export interface FacilityOption extends SelectOption {}

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

//  === 子どもの月齢の型定義 ===
export interface ChildAgeInfo {
  years: number;
  months: number;
  totalMonths: number;
  displayText: string;
  isInfant: boolean;
  isToddler: boolean;
}

export interface ChildWithAge extends ChildWithClass {
  age: ChildAgeInfo;
}
