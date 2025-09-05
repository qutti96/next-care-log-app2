# ER図（Markdown形式）

## Users

- id (PK,UUID)
- name(TEXT)
- tel(TEXT,NULLABLE)
- email (TEXT,UNIQUE)
- password(TEXT,NULLABLE)
- photo_url(TEXT,NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- children → [Children]
- posts → [Posts]

## Children

- id (PK,UUID)
- parent_id (FK → Users.id,UUID)
- name(TEXT)
- nameKana(TEXT,NULLABLE)
- birthday(DATE)
- class_id (FK → Classes.id,UUID)
- allergens(TEXT,NULLABLE)
- milk_amount(TEXT,NULLABLE)
- milk_interval(TEXT,NULLABLE)
- photo_url(TEXT,NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- posts → [Posts]

## Facilities

- id (PK,UUID)
- name(TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- classes → [Classes]
- managers → [Managers]
- staff → [Staffs]

## Classes

- id (PK,UUID)
- name(TEXT)
- facility_id (FK → Facilities.id,UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- children → [Children]
- staff → [Staffs]

## Managers

- id (PK,UUID)
- name(TEXT)
- email (TEXT,UNIQUE)
- facility_id (FK → Facilities.id,UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)

## Staffs

- id (PK,UUID)
- name(TEXT)
- email (TEXT,UNIQUE)
- facility_id (FK → Facilities.id,UUID)
- class_id (FK → Classes.id,UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)

## Posts

- id (PK,UUID)
- child_id (FK → Children.id,UUID)
- parent_id (FK → Users.id,UUID)
- postDay(DATE)
- pick_up_person(TEXT,NULLABLE)
- temperature(TEXT,NULLABLE)
- messages(TEXT,NULLABLE)
- medication_required(BOOLEAN,DEFAULT FALSE)
- type_of_medication(TEXT,NULLABLE)
- timing_of_medication(TEXT,NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- log → Logs (1:1)

## Logs

- id (PK,UUID)
- postId (FK, UNIQUE → Posts.id,UUID)
- scenes (TEXT, NULLABLE)
- photo_url (TEXT, NULLABLE)
- staff (TEXT, NULLABLE)

- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)
- events → [Events]

## Events

- id (PK,UUID)
- logId (FK → Logs.id,UUID)
- event_occurrence_time (TIMESTAMP)
- title (TEXT)
- details (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, NULLABLE)

## ER画像（Mermaid形式）
```mermaid
erDiagram
  Users {
    uuid id PK "保護者ID"
    string name "保護者名"
    string tel "保護者電話番号"
    string email UK "メールアドレス"
    string password "パスワード（nullable）"
    string photo_url "保護者アイコン画像URL"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Children {
    uuid id PK "こどもID"
    uuid parent_id FK "保護者ID"
    string name "こども名"
    string name_kana "こども名かな"
    date birthday "こども誕生日"
    uuid class_id FK "クラスID"
    string allergens "アレルギー食物"
    string milk_amount "1回にあげるミルクの量"
    string milk_interval "ミルクをあげる間隔"
    string photo_url "こどもアイコン画像URL"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Facilities {
    uuid id PK "施設ID"
    string name "施設名"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Classes {
    uuid id PK "クラスID"
    string name "クラス名"
    uuid facility_id FK "施設ID"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Managers {
    uuid id PK "管理者ID"
    string name "管理者名"
    string email UK "管理者メールアドレス"
    uuid facility_id FK "施設ID"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Staffs {
    uuid id PK "スタッフID"
    string name "スタッフ名"
    string email UK "スタッフメールアドレス"
    uuid facility_id FK "施設ID"
    uuid class_id FK "クラスID"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Posts {
  uuid id PK "投稿ID"
    uuid child_id FK "こどもID"
    uuid parent_id FK "保護者ID"
    date post_day "登園日"
    string pick_up_person "今日のお迎え担当"
    string temperature "今日の体温"
    string messages "今日の注意点・指示・昨日・登園前の様子"
    boolean medication_required "投薬の有無"
    string type_of_medication "薬の種類"
    string timing_of_medication "投薬するタイミング"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Logs {
    uuid id PK "ログID"
    uuid post_id FK "投稿ID"
    string scenes "本日の保育中の様子"
    string photo_url "保育画像URL"
    string staff "担当スタッフ"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }
  Events {
    uuid id PK "イベントID"
    uuid log_id FK "ログID"
    timestamp event_occurrence_time "イベント発生時間"
    string title "イベントタイトル"
    string details "イベント内容"
    timestamp created_at "作成日時"
    timestamp updated_at "更新日時"
    timestamp deleted_at "削除日時（nullable）"
  }

  Users ||--o{ Children : "1人のuserは1以上のchildrenを持つ"
  Users ||--o{ Posts : "1人のuserは1以上のpostsを持つ"
  Children ||--o{ Posts : "一人のchildは複数のpostsを持つ"
  Children ||--|| Classes : "一人のChildは一つのclassに所属する"
  Facilities ||--o{ Classes : "一つのfacilityは1以上のclassを持つ"
  Facilities ||--o{ Managers : "一つのfacilityは1以上のmanagerがいる"
  Facilities ||--o{ Staffs : "一つのfacilityは複数のstaffを持つ"
  Classes ||--o{ Staffs : "一つのclassは複数のstaffを持つ"
  Posts ||--|| Logs : "一つのpostに一つのlogがある"
  Logs ||--o{ Events : "一つのlogに複数のeventを持つ"

```