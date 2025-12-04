// src/app/actions/parent-profile.ts → /src/lib/actions/profile.tsに移動
// /src/app/：ルーティングとページコンポーネント専用
// /src/lib/：再利用可能なビジネスロジック・ユーティリティ
//Server Actionsは複数ページから呼び出される可能性が高いため、lib配下が適切

'use server'

import { createServerSupabase } from '@/lib/supabase-server'
import {
  parentProfileFormSchema,
  type ParentProfileFormValues
} from '@/lib/validations/profile'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'

// 型エイリアスを追加（型安全性向上）
type UserInsert = Database['public']['Tables']['users']['Insert']
type ChildInsert = Database['public']['Tables']['children']['Insert']

/**
 * ユーティリティ関数
 */
function getCurrentTimestamp() {
  return new Date().toISOString()
}

async function ensureAuthenticated(supabase: ReturnType<typeof createServerSupabase>, userId: string) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error('Authentication failed:', error?.message)
    redirect('/users/login')
  }
  if (user.id !== userId) {
    console.error('User ID mismatch:', { authUserId: user.id, requestedUserId: userId })
    redirect('/users/login')
  }
  return user
}

/**
 * 保護者プロフィール作成・更新
 * 認証チェック、バリデーション、トランザクション処理を統合
 */
export async function upsertUserProfile(
  dataOrUserId: ParentProfileFormValues | string,
  legacyData?: ParentProfileFormValues
) {
  let userId: string
  let data: ParentProfileFormValues
  if (typeof dataOrUserId === 'string') {
    // 既存インターフェース: upsertUserProfile(userId, data)
    userId = dataOrUserId
    data = legacyData!
  } else {
    // 新インターフェース: upsertUserProfile(data) - data.idを使用
    data = dataOrUserId
    userId = data.id || ''
  }
  if (!userId) {
    return {
      success: false,
      error: 'ユーザーIDが指定されていません'
    }
  }

  const supabase = createServerSupabase()

  // 🔐 認証チェック
  const user = await ensureAuthenticated(supabase, userId)

  // ✅ バリデーション
  const validatedData = parentProfileFormSchema.safeParse(data)
  if (!validatedData.success) {
    console.error('Validation failed:', validatedData.error.issues)
    return {
      success: false,
      error: '入力データが無効です',
      fieldErrors: validatedData.error.issues
    }
  }

  try {
    const timestamp = getCurrentTimestamp()

    // 📝 保護者プロフィール更新
    const userUpsertData: UserInsert = {
      id: userId,
      name: validatedData.data.name,
      email: user.email!, // 認証済みメールアドレス
      role: 'PARENT', // ★ 追加: 保護者ロール設定
      updated_at: timestamp,
  // ★ 重要: 条件付きプロパティでnull問題を解決
      ...(validatedData.data.nameKana && { name_kana: validatedData.data.nameKana }),
      ...(validatedData.data.tel && { tel: validatedData.data.tel }),
      ...(validatedData.data.photoUrl && { photo_url: validatedData.data.photoUrl }),
}

    const { error: userError } = await supabase
      .from('users')
      .upsert( userUpsertData, { onConflict: 'id' })

    if (userError) {
      console.error('User upsert failed:', userError)
      throw new Error(`保護者情報の保存に失敗しました: ${userError.message}`)
    }

    // 👶 子どもデータの処理
    // 既存の子どもデータを取得（ソフトデリート対象の特定用）
    const { data: existingChildren, error: fetchError } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', userId)
      .is('deleted_at', null)

    if (fetchError) {
      console.error('Failed to fetch existing children:', fetchError)
      throw new Error('既存の子ども情報の取得に失敗しました')
    }

    const existingIds = new Set((existingChildren || []).map(child => child.id))

      // upsert対象の子どもデータを準備（0件のこともある）
    const childrenToUpsert: ChildInsert[] = validatedData.data.children.map((child) => ({
      id: child.id || crypto.randomUUID(),
      parent_id: userId,
      name: child.name,
      updated_at: timestamp,
      // ★ 重要: 条件付きプロパティでnull問題を解決
      ...(child.nameKana && { name_kana: child.nameKana }),
      ...(child.birthday && { birthday: child.birthday }),
      ...(child.classId && { class_id: child.classId }),
      ...(child.allergens && { allergens: child.allergens }),
      ...(child.milkAmount && { milk_amount: child.milkAmount }),
      ...(child.milkInterval && { milk_interval: child.milkInterval }),
      ...(child.photoUrl && { photo_url: child.photoUrl }),
    }))

    //children が 1件以上あるときだけ子どもデータをupsert
    if(childrenToUpsert.length > 0) {
      const { error: childrenError } = await supabase
        .from('children')
        .upsert(childrenToUpsert, { onConflict: 'id' })

        if (childrenError) {
          console.error('Children upsert failed:', childrenError)
          throw new Error(`お子さま情報の保存に失敗しました: ${childrenError.message}`)
        }
      }

    // フォームから削除された子どもをソフトデリート
    const currentIds = new Set(childrenToUpsert.map(child => child.id))
    // const deletedIds = [...existingIds].filter(id => !currentIds.has(id))
    const deletedIds = Array.from(existingIds).filter(id => !currentIds.has(id))

    // フォームから削除された子どもをソフトデリート（常に実行）
    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('children')
        .update({
          deleted_at: timestamp,
          updated_at: timestamp
        })
        .in('id', deletedIds)
        .eq('parent_id', userId)

      if (deleteError) {
        console.warn('Children soft delete failed:', deleteError)
        // ソフトデリートの失敗は致命的でないため警告のみ
      }
  }

    // 🔄 キャッシュ更新
    revalidatePath(`/users/${userId}`)
    revalidatePath(`/users/${userId}/edit`)

    console.log(`Profile saved successfully for user: ${userId}`)
    return { success: true }

  } catch (error: unknown) {
    console.error('Profile upsert error:', error)
    const message = error instanceof Error ? error.message : 'プロフィールの保存に失敗しました'
    return {
      success: false,
      error: message
    }
  }
}

/**
 * 保護者プロフィール取得
 * 認証チェックとリレーション取得を統合
 */
export async function getUserProfile(userId: string) {
  const supabase = createServerSupabase()

  // 🔐 認証チェック
  await ensureAuthenticated(supabase, userId)

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        name_kana,
        tel,
        email,
        photo_url,
        role,
        children (
          id,
          name,
          name_kana,
          birthday,
          class_id,
          allergens,
          milk_amount,
          milk_interval,
          photo_url
        )
      `)
      .eq('id', userId)
      .is('children.deleted_at', null) // ソフトデリート対応
      .maybeSingle()

    if (error) {
      console.error('Profile fetch error:', error)
      throw error
    }

    if (!userData) {
      console.log(`No profile found for user: ${userId}`)
      return { success: false, error: 'プロフィールが見つかりません' }
    }

    // 🔄 データ変換（DB形式 → フォーム形式）
    const profile = {
      name: userData.name || '',
      nameKana: userData.name_kana || '',
      tel: userData.tel || '',
      photoUrl: userData.photo_url || '',
      children: (userData.children || [])
        .filter(child => child !== null)
        .map(child => ({
          id: child.id,
          name: child.name,
          nameKana: child.name_kana || '',
          birthday: child.birthday || '',
          classId: child.class_id || '',
          allergens: child.allergens || '',
          milkAmount: child.milk_amount || '',
          milkInterval: child.milk_interval || '',
          photoUrl: child.photo_url || '',
        }))
    }

    console.log(`Profile fetched successfully for user: ${userId}`)
    return { success: true, data: profile }

  } catch (error: unknown) {
    console.error('Profile fetch error:', error)
    return  { 
      success: false,
      error: 'プロフィールの取得に失敗しました'
    }
  }
}
