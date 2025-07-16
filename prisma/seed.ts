// prisma/seed.ts（更新版）
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('シードデータの作成を開始します...');

  // 施設の作成
  const facility = await prisma.facility.upsert({
    where: { id: 'facility-1' },
    update: {},
    create: {
      id: 'facility-1',
      name: 'さくら保育園',
    },
  });

  console.log('施設を作成しました:', facility.name);

  // クラスの作成
  const classData = [
    { id: 'class-1', name: 'ひよこ組（0歳児）', facilityId: facility.id },
    { id: 'class-2', name: 'うさぎ組（1歳児）', facilityId: facility.id },
    { id: 'class-3', name: 'ぱんだ組（2歳児）', facilityId: facility.id },
    { id: 'class-4', name: 'きりん組（3歳児）', facilityId: facility.id },
    { id: 'class-5', name: 'ぞう組（4歳児）', facilityId: facility.id },
    { id: 'class-6', name: 'らいおん組（5歳児）', facilityId: facility.id },
  ];

  for (const cls of classData) {
    const createdClass = await prisma.class.upsert({
      where: { id: cls.id },
      update: {},
      create: cls,
    });
    console.log('クラスを作成しました:', createdClass.name);
  }

  // 管理者の作成
  const manager = await prisma.manager.upsert({
    where: { id: 'manager-1' },
    update: {},
    create: {
      id: 'manager-1',
      name: '園長 太郎',
      email: 'manager@sakura-hoikuen.com',
      facilityId: facility.id,
    },
  });

  console.log('管理者を作成しました:', manager.name);

  // スタッフの作成
  const staff = await prisma.staff.upsert({
    where: { id: 'staff-1' },
    update: {},
    create: {
      id: 'staff-1',
      name: '先生 花子',
      email: 'staff1@sakura-hoikuen.com',
      facilityId: facility.id,
      classId: 'class-1',
    },
  });

  console.log('スタッフを作成しました:', staff.name);

  console.log('シードデータの作成が完了しました！');
}

main()
  .catch((e) => {
    console.error('シードデータの作成でエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });