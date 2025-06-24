// ユーザーロール定義
export const USER_ROLES = {
  PARENT: 'parent',
  STAFF: 'staff', 
  MANAGER: 'manager',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// 基本的なデータベース型定義（ER図に基づく）
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// ユーザー情報（ER図のUserテーブルに対応）
export interface User extends BaseEntity {
  name: string
  tel: string
  email: string
  password: string
  photoUrl?: string
}

// 子ども情報（ER図のChildテーブルに対応）
export interface Child extends BaseEntity {
  parentId: string
  name: string
  nameKana: string
  birthday: string
  allergens?: string
  milk?: string
  photoUrl?: string
}

// 施設情報（ER図のFacilityテーブルに対応）
export interface Facility extends BaseEntity {
  name: string
}

// クラス情報（ER図のClassテーブルに対応）
export interface Class extends BaseEntity {
  name: string
  facilityId: string
}

// 管理者情報（ER図のManagerテーブルに対応）
export interface Manager extends BaseEntity {
  name: string
  email: string
  facilityId: string
}

// スタッフ情報（ER図のStaffテーブルに対応）
export interface Staff extends BaseEntity {
  name: string
  email: string
  facilityId: string
  classId: string
}

// 投稿情報（ER図のPostテーブルに対応）
export interface Post extends BaseEntity {
  childId: string
  parentId: string
  postDay: string
  pickUpPerson: string
  temperature: number
  messages?: string
  medicationRequired: boolean
  typeOfMedication?: string
  timingOfMedication?: string
}

// ログ情報（ER図のLogテーブルに対応）
export interface Log extends BaseEntity {
  postId: string
  scenes?: string
  photoUrl?: string
  staff?: string
}

// イベント情報（ER図のEventテーブルに対応）
export interface Event extends BaseEntity {
  logId: string
  eventOccurrenceTime: string
  title: string
  details?: string
}
