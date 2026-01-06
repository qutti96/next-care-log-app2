
import { getAuthenticatedUser, createUnauthorizedResponse, createErrorResponse } from '@/lib/auth/apiAuth';
import { getChildrenWithAge, createChild } from '@/lib/services/childService';
import { childFormSchema } from '@/lib/validations/child-profile';

// GET /api/children - 子ども一覧取得
export async function GET() { // requestパラメータを削除
  try {
    const user = await getAuthenticatedUser(); // 引数なしで呼び出し
    if (!user) {
      return createUnauthorizedResponse();
    }

    const children = await getChildrenWithAge(user.id);
    
    return new Response(
      JSON.stringify({ success: true, data: children }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('子ども一覧取得エラー:', error);
    return createErrorResponse('子ども一覧の取得に失敗しました', 500);
  }
}

// POST /api/children - 子ども新規作成
export async function POST(request: Request) { // NextRequestではなくRequest
  try {
    const user = await getAuthenticatedUser(); // 引数なしで呼び出し
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();

    // バリデーション
    const validationResult = childFormSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '入力データが無効です',
          details: validationResult.error.issues
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  // ✅ 型安全なデータ変換（既存ChildFormData型に適合）
  const childData = {
    parentId: user.id,
    name: validationResult.data.name,
    nameKana: validationResult.data.nameKana || undefined,
    birthday: validationResult.data.birthday,
    // classId: null/undefined を空文字に変換（既存API仕様に合わせる）
    classId: validationResult.data.classId || '',
    allergens: validationResult.data.allergens || undefined,
    // 数値型をそのまま渡す
    milkAmount: validationResult.data.milkAmount,
    milkInterval: validationResult.data.milkInterval,
    photoUrl: validationResult.data.photoUrl || undefined,
  };

    // サービス層呼び出し
    const newChild = await createChild(childData);

    return new Response(
      JSON.stringify({ success: true, data: newChild }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('子ども作成エラー:', error);
    return createErrorResponse('子どもの登録に失敗しました', 500);
  }
}