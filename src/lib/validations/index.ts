// src/lib/validations/index.ts
//型定義の一元管理のため：インデックスファイルの作成
// 保護者プロフィール関連
export {
  parentProfileFormSchema,
  serverParentProfileSchema,
  userProfileFormSchema, // 互換性のため
  type ParentProfileFormValues,
  type ServerParentProfileInput,
  type UserProfileFormInput, // 互換性のため
} from './profile'

// 子どもプロフィール関連
export {
  childFormSchema,
  updateChildSchema,
  type ChildFormValues,
  // type ParentChildFormValues,
} from './child-profile'
