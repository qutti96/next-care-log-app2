
import { getAuthenticatedUser, createUnauthorizedResponse, createErrorResponse } from '@/lib/auth/apiAuth';
import { getChildrenWithAge, createChild } from '@/lib/services/childService';
import { childFormSchema } from '@/lib/validations/child';

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

    // サービス層呼び出し
    const newChild = await createChild({
      ...validationResult.data,
      parentId: user.id
    });

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