// src/lib/storage.ts
import { getBrowserSupabase } from '@/lib/supabaseBrowser'
import { ImageUploadResult } from '@/types/storage'
import { AVATAR_ALLOWED_MIME, AVATAR_MAX_SIZE } from '@/types/storage'

const BUCKET = 'avatars'

/**
 * アバター用ストレージパス生成
 * RLS: 第一階層はuser ID
 */
export function buildAvatarPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`
}

/**
 * ファイル名生成（重複回避）
 */
export function buildAvatarFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'webp'
  return `${Date.now()}.${ext}`
}

/**
 * Client用署名付きURL生成
 */
export async function getSignedAvatarUrlClient(
  path: string, 
  expiresInSec: number = 60 * 60
): Promise<string> {
  const supabase = getBrowserSupabase()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSec)
  
  if (error) throw error
  return data.signedUrl
}

/**
 * ファイルアップロード（クライアント用）
 */
export async function uploadAvatarFile(
  userId: string,
  file: File
): Promise<ImageUploadResult> {
  const supabase = getBrowserSupabase()
  
  // バリデーション
  if (!AVATAR_ALLOWED_MIME.test(file.type)) {
    throw new Error('画像ファイルを選択してください')
  }
  
  if (file.size > AVATAR_MAX_SIZE) {
    throw new Error('ファイルサイズは5MB以下にしてください')
  }
  
  const fileName = buildAvatarFileName(file.name)
  const filePath = buildAvatarPath(userId, fileName)
  
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })
  
  if (error) throw error
  
  return {
    path: filePath,
    size: file.size,
    type: file.type,
  }
}
