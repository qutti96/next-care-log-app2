// app/api/children/[id]/route.ts
import { getAuthenticatedUser, createUnauthorizedResponse, createErrorResponse } from '@/lib/auth/apiAuth';
import { getChildById, updateChild, deleteChild } from '@/lib/services/childService';
import { childFormSchema } from '@/lib/validations/child';

// GET /api/children/[id] - 個別子ども取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const users = await getAuthenticatedUser();
    if (!users) {
      return createUnauthorizedResponse();
    }

    const children = await getChildById(params.id, users.id);

    if (!children) {
      return createErrorResponse('子どもが見つかりません', 404);
    }

    return Response.json({
      success: true,
      data: children
    });

  } catch (error) {
    console.error('子ども取得エラー:', error);
    return createErrorResponse('子どもの取得に失敗しました', 500);
  }
}

// PUT /api/children/[id] - 子ども情報更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();

    // 部分更新用バリデーション
    const validationResult = childFormSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return Response.json({
        success: false,
        error: '入力データが無効です',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    try {
      const updatedChild = await updateChild(params.id, user.id, validationResult.data);

      return Response.json({
        success: true,
        data: updatedChild
      });
    } catch (e: unknown) {
      // 所有権エラーなどの場合
      if (e instanceof Error && (e.message.includes('見つからない') || e.message.includes('権限'))) {
        return createErrorResponse(e.message, 403);
      }
      throw e; // その他のエラーは外側のcatchへ
    }

  } catch (error) {
    console.error('子ども更新エラー:', error);
    return createErrorResponse('子どもの更新に失敗しました', 500);
  }
}

// DELETE /api/children/[id] - 子ども削除（論理削除）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    try {
      const deletedChild = await deleteChild(params.id, user.id);
      
      return Response.json({
        success: true,
        data: deletedChild,
        message: '子どもを削除しました'
      });
    } catch (e: unknown) {
      // 所有権エラーなどの場合
      if (e instanceof Error && (e.message.includes('見つからない') || e.message.includes('権限'))) {
        return createErrorResponse(e.message, 403);
      }
      throw e; // その他のエラーは外側のcatchへ
    }
    
  } catch (error) {
    console.error('子ども削除エラー:', error);
    return createErrorResponse('子どもの削除に失敗しました', 500);
  }
}