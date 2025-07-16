// src/types/database.ts
// カスタム型定義が必要な理由：
// フォーム入力: HTMLフォームではbirthdayは文字列だが、DBではDateTime型
// API通信: リクエスト/レスポンスの構造がDBモデルと異なる場合
// バリデーション: 入力値の検証用の型定義
// UI表示: 画面表示用に加工されたデータの型定義

// @prisma/client から自動生成される型
import { User, Child, Facility, Class, Manager, Staff, Post, Log, Event } from '@prisma/client';

// === リレーションを含む型定義 ===
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



// 子どもプロファイル登録・編集フォーム用のデータ型定義
export interface ChildFormData {
  name: string;
  nameKana?: string;
  birthday: string; // フォームでは文字列として扱うことが多い
  classId: string;
  allergens?: string;
  milkAmount?: string; // フォームでは文字列として扱う
  milkInterval?: string; // フォームでは文字列として扱う
  photoUrl?: string;
}

// 子どもプロファイル作成用（サーバーサイド）
export interface ChildCreateData {
  parentId: string;
  name: string;
  nameKana?: string;
  birthday: Date; // サーバーサイドではDate型
  classId: string;
  allergens?: string;
  milkAmount?: string;
  milkInterval?: string;
  photoUrl?: string;
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