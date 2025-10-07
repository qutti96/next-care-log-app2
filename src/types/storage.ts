/**
 * 画像アップロード用の型定義
 */
export interface ImageUploadResult {
  path: string      // storage path (userId/filename.ext)
  url?: string      // 署名付きURL（表示用）
  size: number
  type: string
}

export type ImageUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_TYPE'
  | 'UPLOAD_FAILED'
  | 'PERMISSION_DENIED'

export interface ImageUploadError {
  code: ImageUploadErrorCode
  message: string
}

// ストレージ関連の定数も一元管理
export const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const AVATAR_ALLOWED_MIME = /^image\//
