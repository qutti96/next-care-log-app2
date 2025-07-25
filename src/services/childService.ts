// lib/services/childService.ts（月齢計算統合版）
import { prisma } from '@/lib/prisma';
import { ChildFormData, ChildWithAge } from '@/types';
import { getDetailedAge } from '@/lib/utils/dateUtils';

export async function createChild(data: ChildFormData & {parentId: string}): Promise<ChildWithAge> {
  // string型からDate型に変換してデータベースに保存
  const child = await prisma.child.create({
    data: {
      ...data,
      birthday: new Date(data.birthday), // 重要：ここで変換
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
