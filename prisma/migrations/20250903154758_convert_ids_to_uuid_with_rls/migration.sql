-- UUID型変換マイグレーション（データ変換対応版）
BEGIN;

-- Step 1: 必要な拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: 既存RLSポリシーの削除（型不一致エラー回避）
DROP POLICY IF EXISTS "Parents can manage own children" ON "public"."children";
DROP POLICY IF EXISTS "Parents can manage own posts" ON "public"."posts";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."users";
DROP POLICY IF EXISTS "Staff can manage events" ON "public"."events";
DROP POLICY IF EXISTS "Staff can manage logs" ON "public"."logs";

-- Step 3: RLS一時無効化
ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."children" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."posts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."logs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."facilities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."managers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffs" DISABLE ROW LEVEL SECURITY;

-- Step 4: 外部キー制約の一時削除
ALTER TABLE "public"."children" DROP CONSTRAINT IF EXISTS "children_parent_id_fkey";
ALTER TABLE "public"."children" DROP CONSTRAINT IF EXISTS "children_class_id_fkey";
ALTER TABLE "public"."posts" DROP CONSTRAINT IF EXISTS "posts_child_id_fkey";
ALTER TABLE "public"."posts" DROP CONSTRAINT IF EXISTS "posts_parent_id_fkey";
ALTER TABLE "public"."logs" DROP CONSTRAINT IF EXISTS "logs_post_id_fkey";
ALTER TABLE "public"."events" DROP CONSTRAINT IF EXISTS "events_log_id_fkey";
ALTER TABLE "public"."classes" DROP CONSTRAINT IF EXISTS "classes_facility_id_fkey";
ALTER TABLE "public"."managers" DROP CONSTRAINT IF EXISTS "managers_facility_id_fkey";
ALTER TABLE "public"."staffs" DROP CONSTRAINT IF EXISTS "staffs_facility_id_fkey";
ALTER TABLE "public"."staffs" DROP CONSTRAINT IF EXISTS "staffs_class_id_fkey";

-- Step 5: 非UUIDデータのマッピングテーブル作成
CREATE TEMPORARY TABLE temp_map_facilities AS
SELECT id AS old_id, gen_random_uuid() AS new_id
FROM "public"."facilities"
WHERE id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

CREATE TEMPORARY TABLE temp_map_classes AS
SELECT id AS old_id, gen_random_uuid() AS new_id
FROM "public"."classes"
WHERE id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Step 6: 施設IDの更新（PK → FK の順序）
-- 施設のPK更新
UPDATE "public"."facilities" f
SET id = m.new_id::text
FROM temp_map_facilities m
WHERE f.id = m.old_id;

-- 施設を参照するFKの同期更新
UPDATE "public"."classes" c
SET facility_id = m.new_id::text
FROM temp_map_facilities m
WHERE c.facility_id = m.old_id;

UPDATE "public"."managers" ma
SET facility_id = m.new_id::text
FROM temp_map_facilities m
WHERE ma.facility_id = m.old_id;

UPDATE "public"."staffs" st
SET facility_id = m.new_id::text
FROM temp_map_facilities m
WHERE st.facility_id = m.old_id;

-- Step 7: クラスIDの更新（PK → FK の順序）
-- クラスのPK更新
UPDATE "public"."classes" c
SET id = m.new_id::text
FROM temp_map_classes m
WHERE c.id = m.old_id;

-- クラスを参照するFKの同期更新
UPDATE "public"."children" ch
SET class_id = m.new_id::text
FROM temp_map_classes m
WHERE ch.class_id = m.old_id;

UPDATE "public"."staffs" st
SET class_id = m.new_id::text
FROM temp_map_classes m
WHERE st.class_id = m.old_id;

-- Step 8: 全カラムのUUID型変換（この時点で全てがUUID文字列形式）
-- 参照先（PK）から変更
ALTER TABLE "public"."facilities" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."classes" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."users" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."children" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."managers" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."staffs" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."posts" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."logs" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
ALTER TABLE "public"."events" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;

-- 参照元（FK）を変更
ALTER TABLE "public"."children" ALTER COLUMN "parent_id" TYPE uuid USING "parent_id"::uuid;
ALTER TABLE "public"."children" ALTER COLUMN "class_id" TYPE uuid USING "class_id"::uuid;
ALTER TABLE "public"."posts" ALTER COLUMN "child_id" TYPE uuid USING "child_id"::uuid;
ALTER TABLE "public"."posts" ALTER COLUMN "parent_id" TYPE uuid USING "parent_id"::uuid;
ALTER TABLE "public"."logs" ALTER COLUMN "post_id" TYPE uuid USING "post_id"::uuid;
ALTER TABLE "public"."events" ALTER COLUMN "log_id" TYPE uuid USING "log_id"::uuid;
ALTER TABLE "public"."classes" ALTER COLUMN "facility_id" TYPE uuid USING "facility_id"::uuid;
ALTER TABLE "public"."managers" ALTER COLUMN "facility_id" TYPE uuid USING "facility_id"::uuid;
ALTER TABLE "public"."staffs" ALTER COLUMN "facility_id" TYPE uuid USING "facility_id"::uuid;
ALTER TABLE "public"."staffs" ALTER COLUMN "class_id" TYPE uuid USING "class_id"::uuid;

-- Step 9: 外部キー制約の再作成
ALTER TABLE "public"."children" 
ADD CONSTRAINT "children_parent_id_fkey" 
FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."children" 
ADD CONSTRAINT "children_class_id_fkey" 
FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id");

ALTER TABLE "public"."posts" 
ADD CONSTRAINT "posts_child_id_fkey" 
FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE;

ALTER TABLE "public"."posts" 
ADD CONSTRAINT "posts_parent_id_fkey" 
FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."logs" 
ADD CONSTRAINT "logs_post_id_fkey" 
FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE "public"."events" 
ADD CONSTRAINT "events_log_id_fkey" 
FOREIGN KEY ("log_id") REFERENCES "public"."logs"("id") ON DELETE CASCADE;

ALTER TABLE "public"."classes" 
ADD CONSTRAINT "classes_facility_id_fkey" 
FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;

ALTER TABLE "public"."managers" 
ADD CONSTRAINT "managers_facility_id_fkey" 
FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;

ALTER TABLE "public"."staffs" 
ADD CONSTRAINT "staffs_facility_id_fkey" 
FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;

ALTER TABLE "public"."staffs" 
ADD CONSTRAINT "staffs_class_id_fkey" 
FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id");

-- Step 10: RLS再有効化とUUID対応ポリシー作成
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_uuid_policy" ON "public"."users" FOR ALL TO authenticated 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE "public"."children" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "children_parent_uuid_policy" ON "public"."children" FOR ALL TO authenticated 
USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_parent_uuid_policy" ON "public"."posts" FOR ALL TO authenticated 
USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

ALTER TABLE "public"."logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_post_access_policy" ON "public"."logs" FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM "public"."posts" 
    WHERE id = logs.post_id AND auth.uid() = posts.parent_id
)) WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."posts" 
    WHERE id = logs.post_id AND auth.uid() = posts.parent_id
));

ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_log_access_policy" ON "public"."events" FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM "public"."logs" 
    JOIN "public"."posts" ON logs.post_id = posts.id
    WHERE logs.id = events.log_id AND auth.uid() = posts.parent_id
)) WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."logs" 
    JOIN "public"."posts" ON logs.post_id = posts.id
    WHERE logs.id = events.log_id AND auth.uid() = posts.parent_id
));

-- 管理系テーブルのRLS有効化
ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."facilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."managers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffs" ENABLE ROW LEVEL SECURITY;

COMMIT;
