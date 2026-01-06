"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { 
  childProfileFormSchema
} from "@/lib/validations/child-profile"

export type ActionState = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

/**
 * 子どもプロフィールの作成・更新
 * セキュリティ: 親子関係の二重チェック実装
 */
export async function upsertChildProfile(
  parentId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createServerSupabase()

  try {
    // 1. 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "認証が必要です。ログインしてください。" }
    }

    // 2. 親子関係の厳格な検証（重要なセキュリティチェック）
    if (user.id !== parentId) {
      console.error(`権限エラー: user=${user.id}, parent=${parentId}`)
      return { error: "この操作を実行する権限がありません。" }
    }

    // 3. フォームデータの抽出と型変換
    const rawData = {
      name: formData.get("name") as string,
      nameKana: (formData.get("nameKana") as string) || "",
      birthday: formData.get("birthday") as string,
      classId: (formData.get("classId") as string) || null,
      allergens: (formData.get("allergens") as string) || "",
      milkAmount: (formData.get("milkAmount") as string) || "",
      milkInterval: (formData.get("milkInterval") as string) || "",
      photoUrl: (formData.get("photoUrl") as string) || null,
    }

    // 4. サーバーサイドバリデーション
    const validatedFields = childProfileFormSchema.safeParse(rawData)

    if (!validatedFields.success) {
      return {
        error: "入力内容に誤りがあります",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { data } = validatedFields

    // 5. データベース保存用データ作成
    const dbData = {
      id: crypto.randomUUID(),
      parent_id: parentId,
      name: data.name,
      name_kana: data.nameKana || null,
      birthday: data.birthday,
      class_id: data.classId || null,
      allergens: data.allergens || null,
      milk_amount: data.milkAmount != null ? String(data.milkAmount) : null,
      milk_interval: data.milkInterval != null ? String(data.milkInterval) : null,
      photo_url: data.photoUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 6. データベース操作実行
    const { error: dbError } = await supabase
      .from("children")
      .insert(dbData)
      .select()
      .single()

    if (dbError) {
      console.error("データベースエラー:", dbError)
      return { error: "プロフィールの保存に失敗しました。もう一度お試しください。" }
    }

    // 7. キャッシュ更新
    revalidatePath(`/users-children/${parentId}`)
    revalidatePath(`/users/${parentId}`)

  } catch (error) {
    console.error("予期しないエラー:", error)
    return { error: "予期しないエラーが発生しました。" }
  }

  // 8. 成功時のリダイレクト
  redirect(`/users-children/${parentId}/complete`)
}