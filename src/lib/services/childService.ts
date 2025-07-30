// lib/services/childService.ts（月齢計算統合版）
import { prisma } from '@/lib/prisma';
import { ChildFormData, ChildWithAge } from '@/types';
import { getDetailedAge } from '@/lib/utils/dateUtils';

//子ども新規登録(create)
export async function createChild(data: ChildFormData & {parentId: string}): Promise<ChildWithAge> {
  // string型からDate型に変換してデータベースに保存
  const child = await prisma.child.create({
    data: {
      ...data,
      birthday: new Date(data.birthday), // 重要：ここでstring → Date変換
    },
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
  });

  // 月齢情報を追加して返す
  return {
    ...child,
    age: getDetailedAge(child.birthday),
  };
}

//子ども情報一覧取得
export async function getChildrenWithAge(parentId: string): Promise<ChildWithAge[]> {
  const children = await prisma.child.findMany({
    where: {
      parentId,
      deletedAt: null
    },
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
    orderBy: {
      birthday: 'desc', // 生年月日の新しい順
    },
  });

  return children.map(child => ({
    ...child,
    age: getDetailedAge(child.birthday),
  }));
}

//子ども情報個別取得
// READ（個別取得）- 編集画面・詳細画面で必須
export async function getChildById(id: string, parentId: string): Promise<ChildWithAge | null> {
  const child = await prisma.child.findFirst({
    where: {
      id,
      parentId, // 重要：所有権チェック
      deletedAt: null
    },
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
  });

  if (!child) return null;

  return {
    ...child,
    age: getDetailedAge(child.birthday),
  };
}

// 子ども情報の編集 UPDATE - 既存パターン踏襲で一貫性保持
export async function updateChild(
  id: string,
  parentId: string,
  data: UpdateChildInput
): Promise<ChildWithAge> {
  // 所有権チェック（セキュリティ重要）
  const existingChild = await prisma.child.findFirst({
    where: { id, parentId, deletedAt: null }
  });

  if (!existingChild) {
    throw new Error('子どもが見つからないか、編集権限がありません');
  }

  // データ更新（birthdayがある場合のみDate変換）
  const updateData = {
    ...data,
    ...(data.birthday && { birthday: new Date(data.birthday) }),
  };

  const updatedChild = await prisma.child.update({
    where: { id },
    data: updateData,
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
  });

  return {
    ...updatedChild,
    age: getDetailedAge(updatedChild.birthday),
  };
}

// 子ども情報削除 DELETE（論理削除）- 既存の論理削除思想を踏襲
export async function deleteChild(id: string, parentId: string): Promise<ChildWithAge> {
  // 所有権チェック
  const existingChild = await prisma.child.findFirst({
    where: { id, parentId, deletedAt: null }
  });

  if (!existingChild) {
    throw new Error('子どもが見つからないか、削除権限がありません');
  }

  const deletedChild = await prisma.child.update({
    where: { id },
    data: {
      deletedAt: new Date()
    },
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
  });

  return {
    ...deletedChild,
    age: getDetailedAge(deletedChild.birthday),
  };
}

// 🆕 復元機能（管理者向け・オプション）
export async function restoreChild(id: string, parentId: string): Promise<ChildWithAge> {
  const restoredChild = await prisma.child.update({
    where: { id },
    data: {
      deletedAt: null
    },
    include: {
      class: {
        include: {
          facility: true,
        },
      },
    },
  });

  return {
    ...restoredChild,
    age: getDetailedAge(restoredChild.birthday),
  };
}