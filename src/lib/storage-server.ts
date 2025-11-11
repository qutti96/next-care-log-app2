// src/lib/storage-server.ts
'use server'

import { createServerSupabase } from '@/lib/supabase-server'

const BUCKET = 'avatars'

/**
 * Server用署名付きURL生成（RSC/Server Actions）
 */
export async function getSignedAvatarUrlServer(
  path: string, 
  expiresInSec: number = 60 * 60
): Promise<string> {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSec)
  
  if (error) throw error
  return data.signedUrl
}

