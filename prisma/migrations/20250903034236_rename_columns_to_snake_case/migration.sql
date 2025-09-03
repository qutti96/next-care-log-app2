-- 安全なカラムリネーム・マイグレーション（条件付きリネーム対応版）
BEGIN;

-- Step 1: 条件付きリネーム用ヘルパー関数作成
CREATE OR REPLACE FUNCTION public._rename_col_if_exists(
  sche text, tbl text, oldcol text, newcol text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = sche
      AND table_name = tbl
      AND column_name = oldcol
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I', sche, tbl, oldcol, newcol);
    RAISE NOTICE 'Renamed column %.%: % → %', tbl, sche, oldcol, newcol;
  ELSE
    RAISE NOTICE 'Column %.%.% does not exist, skipping', sche, tbl, oldcol;
  END IF;
END;

$$;

-- Step 2: RLS一時無効化（安全のため）
ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."children" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."posts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."logs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."facilities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."managers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffs" DISABLE ROW LEVEL SECURITY;

-- Step 3: 既存RLSポリシーの削除
DROP POLICY IF EXISTS "users_uuid_policy" ON "public"."users";
DROP POLICY IF EXISTS "children_parent_uuid_policy" ON "public"."children";
DROP POLICY IF EXISTS "posts_parent_uuid_policy" ON "public"."posts";
DROP POLICY IF EXISTS "logs_post_access_policy" ON "public"."logs";
DROP POLICY IF EXISTS "events_log_access_policy" ON "public"."events";
DROP POLICY IF EXISTS "users_uuid_to_text_policy" ON "public"."users";
DROP POLICY IF EXISTS "children_parent_access_policy" ON "public"."children";

-- Step 4: 外部キー制約の一時削除（実制約名使用）
ALTER TABLE "public"."children" DROP CONSTRAINT IF EXISTS "children_parentId_fkey";
ALTER TABLE "public"."children" DROP CONSTRAINT IF EXISTS "children_classId_fkey";
ALTER TABLE "public"."posts" DROP CONSTRAINT IF EXISTS "posts_childId_fkey";
ALTER TABLE "public"."posts" DROP CONSTRAINT IF EXISTS "posts_parentId_fkey";
ALTER TABLE "public"."logs" DROP CONSTRAINT IF EXISTS "logs_postId_fkey";
ALTER TABLE "public"."events" DROP CONSTRAINT IF EXISTS "events_logId_fkey";
ALTER TABLE "public"."classes" DROP CONSTRAINT IF EXISTS "classes_facilityId_fkey";
ALTER TABLE "public"."managers" DROP CONSTRAINT IF EXISTS "managers_facilityId_fkey";
ALTER TABLE "public"."staffs" DROP CONSTRAINT IF EXISTS "staffs_facilityId_fkey";
ALTER TABLE "public"."staffs" DROP CONSTRAINT IF EXISTS "staffs_classId_fkey";

-- Step 5: 条件付きカラムリネーム（存在するカラムのみリネーム）
-- Users テーブル
SELECT public._rename_col_if_exists('public','users','photoUrl','photo_url');
SELECT public._rename_col_if_exists('public','users','createdAt','created_at');
SELECT public._rename_col_if_exists('public','users','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','users','deletedAt','deleted_at');

-- Children テーブル
SELECT public._rename_col_if_exists('public','children','parentId','parent_id');
SELECT public._rename_col_if_exists('public','children','nameKana','name_kana');
SELECT public._rename_col_if_exists('public','children','classId','class_id');
SELECT public._rename_col_if_exists('public','children','milkAmount','milk_amount');
SELECT public._rename_col_if_exists('public','children','milkInterval','milk_interval');
SELECT public._rename_col_if_exists('public','children','photoUrl','photo_url');
SELECT public._rename_col_if_exists('public','children','createdAt','created_at');
SELECT public._rename_col_if_exists('public','children','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','children','deletedAt','deleted_at');

-- Posts テーブル
SELECT public._rename_col_if_exists('public','posts','childId','child_id');
SELECT public._rename_col_if_exists('public','posts','parentId','parent_id');
SELECT public._rename_col_if_exists('public','posts','postDay','post_day');
SELECT public._rename_col_if_exists('public','posts','pickUpPerson','pick_up_person');
SELECT public._rename_col_if_exists('public','posts','medicationRequired','medication_required');
SELECT public._rename_col_if_exists('public','posts','typeOfMedication','type_of_medication');
SELECT public._rename_col_if_exists('public','posts','timingOfMedication','timing_of_medication');
SELECT public._rename_col_if_exists('public','posts','createdAt','created_at');
SELECT public._rename_col_if_exists('public','posts','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','posts','deletedAt','deleted_at');

-- Logs テーブル
SELECT public._rename_col_if_exists('public','logs','postId','post_id');
SELECT public._rename_col_if_exists('public','logs','photoUrl','photo_url');
SELECT public._rename_col_if_exists('public','logs','createdAt','created_at');
SELECT public._rename_col_if_exists('public','logs','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','logs','deletedAt','deleted_at');

-- Events テーブル
SELECT public._rename_col_if_exists('public','events','logId','log_id');
SELECT public._rename_col_if_exists('public','events','eventOccurrenceTime','event_occurrence_time');
SELECT public._rename_col_if_exists('public','events','createdAt','created_at');
SELECT public._rename_col_if_exists('public','events','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','events','deletedAt','deleted_at');

-- Classes テーブル
SELECT public._rename_col_if_exists('public','classes','facilityId','facility_id');
SELECT public._rename_col_if_exists('public','classes','createdAt','created_at');
SELECT public._rename_col_if_exists('public','classes','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','classes','deletedAt','deleted_at');

-- Facilities テーブル
SELECT public._rename_col_if_exists('public','facilities','createdAt','created_at');
SELECT public._rename_col_if_exists('public','facilities','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','facilities','deletedAt','deleted_at');

-- Managers テーブル
SELECT public._rename_col_if_exists('public','managers','facilityId','facility_id');
SELECT public._rename_col_if_exists('public','managers','createdAt','created_at');
SELECT public._rename_col_if_exists('public','managers','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','managers','deletedAt','deleted_at');

-- Staffs テーブル
SELECT public._rename_col_if_exists('public','staffs','facilityId','facility_id');
SELECT public._rename_col_if_exists('public','staffs','classId','class_id');
SELECT public._rename_col_if_exists('public','staffs','createdAt','created_at');
SELECT public._rename_col_if_exists('public','staffs','updatedAt','updated_at');
SELECT public._rename_col_if_exists('public','staffs','deletedAt','deleted_at');

-- Step 6: UNIQUE制約とインデックスの追加
CREATE UNIQUE INDEX IF NOT EXISTS "logs_post_id_key" ON "public"."logs"("post_id");
CREATE INDEX IF NOT EXISTS "children_parent_id_idx" ON "public"."children"("parent_id");
CREATE INDEX IF NOT EXISTS "children_class_id_idx" ON "public"."children"("class_id");
CREATE INDEX IF NOT EXISTS "posts_child_id_post_day_idx" ON "public"."posts"("child_id", "post_day");
CREATE INDEX IF NOT EXISTS "posts_parent_id_idx" ON "public"."posts"("parent_id");
CREATE INDEX IF NOT EXISTS "classes_facility_id_idx" ON "public"."classes"("facility_id");
CREATE INDEX IF NOT EXISTS "managers_facility_id_idx" ON "public"."managers"("facility_id");
CREATE INDEX IF NOT EXISTS "staffs_facility_id_idx" ON "public"."staffs"("facility_id");
CREATE INDEX IF NOT EXISTS "staffs_class_id_idx" ON "public"."staffs"("class_id");
CREATE INDEX IF NOT EXISTS "events_log_id_event_occurrence_time_idx" ON "public"."events"("log_id", "event_occurrence_time");

-- Step 7: 外部キー制約の再作成（snake_caseカラムで）
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

-- Step 8: RLS再有効化と基本ポリシー作成（authスキーマ存在時のみ実行）
    

-- Step 9: ヘルパー関数の削除（クリーンアップ）
DROP FUNCTION IF EXISTS public._rename_col_if_exists(text, text, text, text);

COMMIT;
