"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"
import { childProfileFormSchema } from "@/lib/validations/child-profile"
import type { ChildFormData } from "@/types"

export type ActionState = {
  error?: string
  success?: boolean
  data?: {
    id: string
    name: string
    birthday: string | null // nullの可能性も考慮
    [key: string]: unknown
  }
  fieldErrors?: Record<string, string[]>
}

/**
 * 子どもプロフィールの作成・更新
 * セキュリティ: 親子関係の二重チェック実装
 * 
 * @param formData - フォームから送信された型安全なデータ
 * @param parentId - 保護者ID（URL由来）
 * @param childId - 子どもID（編集時のみ）
 */

export async function upsertChildProfile(
  formData: ChildFormData & { parentId: string; id?: string }
): Promise<ActionState> {
  const supabase = createServerSupabase()

  try {
    // 1. 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "認証が必要です。ログインしてください。" }
    }

    // 2. 親子関係の厳格な検証（URL改ざん防止）
    if (user.id !== formData.parentId) {
      console.error(`権限エラー: user=${user.id}, parent=${formData.parentId}`)
      return { error: "この操作を実行する権限がありません。" }
    }

    // 3. サーバーサイドバリデーション
    const validatedFields = childProfileFormSchema.safeParse(formData)

    if (!validatedFields.success) {
      return {
        error: "入力内容に誤りがあります",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // 4. データベース保存用データ作成（スキーマに完全準拠）
    const dbData = {
      parent_id: formData.parentId,
      name: data.name,
      name_kana: data.nameKana || null,
      birthday: data.birthday, // 修正: 既にstring型なので変換不要
      class_id: data.classId || null,
      allergens: data.allergens || null,
      // 🔥 一時対応: Supabase型定義との整合性のため文字列変換
      milk_amount: data.milkAmount !== null ? String(data.milkAmount) : null,
      milk_interval: data.milkInterval !== null ? String(data.milkInterval) : null,
      photo_url: data.photoUrl || null,
      updated_at: new Date().toISOString(),
    }

    let result

    if (formData.id) {
      // 5a. 更新処理（Edit）
      const { data: updateResult, error: dbError } = await supabase
        .from("children")
        .update(dbData)
        .eq("id", formData.id)
        .eq("parent_id", user.id) // 二重チェック
        .select()
        .single()

      if (dbError) {
        console.error("データベースエラー:", dbError)
        return { error: "プロフィールの更新に失敗しました。もう一度お試しください。" }
      }

      result = updateResult
    } else {
      // 5b. 新規作成（Create）
      const { data: createResult, error: dbError } = await supabase
        .from("children")
        .insert({
          ...dbData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (dbError) {
        console.error("データベースエラー:", dbError)
        return { error: "プロフィールの作成に失敗しました。もう一度お試しください。" }
      }

      result = createResult
    }

    // 6. キャッシュ更新
    revalidatePath(`/users/${user.id}`)
    revalidatePath(`/users/${user.id}/children`)
    revalidatePath(`/users/${user.id}/children/${result.id}`)

    return { success: true, data: result }

  } catch (error) {
    console.error("予期しないエラー:", error)
    return { error: "予期しないエラーが発生しました。" }
  }
}

/**
 * 子どもプロフィールの取得
 * セキュリティ: 親子関係の検証
 */
export async function getChildProfile(childId: string): Promise<ActionState> {
  const supabase = createServerSupabase()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "認証が必要です。" }
    }

    const { data, error } = await supabase
      .from("children")
      .select(`
        *,
        classes:class_id (
          id,
          name
        )
      `)
      .eq("id", childId)
      .eq("parent_id", user.id) // セキュリティチェック
      .single()

    if (error) {
      console.error("データ取得エラー:", error)
      return { error: "データが見つかりません。" }
    }

    return { success: true, data }

  } catch (error) {
    console.error("予期しないエラー:", error)
    return { error: "予期しないエラーが発生しました。" }
  }
}

/**
 * 子どもプロフィールの削除（ソフトデリート）
 */
export async function deleteChildProfile(childId: string): Promise<ActionState> {
  const supabase = createServerSupabase()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "認証が必要です。" }
    }

    // ソフトデリート（deleted_atを設定）
    const { error } = await supabase
      .from("children")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", childId)
      .eq("parent_id", user.id) // セキュリティチェック

    if (error) {
      console.error("削除エラー:", error)
      return { error: "削除に失敗しました。" }
    }

    revalidatePath(`/users/${user.id}`)
    
    return { success: true }

  } catch (error) {
    console.error("予期しないエラー:", error)
    return { error: "予期しないエラーが発生しました。" }
  }
}
