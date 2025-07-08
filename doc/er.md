# ER図（Markdown形式）

## Users

- id (PK)
- name
- tel
- email (UNIQUE)
- password
- photoUrl
- children → [Children]
- posts → [Posts]

## Children

- id (PK)
- parentId (FK → Users.id)
- name
- nameKana
- birthday
- classId (FK → Classes.id)
- allergens
- milk_amount
- milk_interval
- photoUrl
- posts → [Posts]

## Facilities

- id (PK)
- name
- classes → [Classes]
- managers → [Managers]
- staff → [Staffs]

## Classes

- id (PK)
- name
- facilityId (FK → Facilities.id)
- staff → [Staffs]

## Managers

- id (PK)
- name
- email (UNIQUE)
- facilityId (FK → Facilities.id)

## Staffs

- id (PK)
- name
- email (UNIQUE)
- facilityId (FK → Facilities.id)
- classId (FK → Classes.id)

## Posts

- id (PK)
- childId (FK → Children.id)
- parentId (FK → Users.id)
- postDay
- pickUpPerson
- temperature
- messages
- medicationRequired
- typeOfMedication
- timingOfMedication
- log → Logs (1:1)
- createdAt
- updatedAt
- deletedAt

## Logs

- id (PK)
- postId (FK, UNIQUE → Posts.id)
- scenes
- photoUrl
- staff
- events → [Events]
- createdAt
- updatedAt
- deletedAt

## Events

- id (PK)
- logId (FK → Logs.id)
- eventOccurrenceTime
- title
- details
- createdAt
- updatedAt
- deletedAt

## ER画像（Mermaid形式）
```mermaid
erDiagram
  Users ||--o{ Children : "1人のuserは1以上のchildrenを持つ"
  Classes ||--o{ Staffs : "一つのclassは複数のstaffを持つ"
  Facilities ||--o{ Staffs : "一つのfacilityは複数のstaffを持つ"
  Facilities ||--o{ Managers : "一つのfacilityは1以上のmanagerがいる"
  Facilities ||--o{ Classes : "一つのfacilityは1以上のclassを持つ"
  Children ||--o{ Posts : "一人のchildは複数のpostsを持つ"
  Children ||--|| Classes : "一人のChildは一つのclassに所属する"
  Posts ||--|| Logs : "一つのpostに一つのlogがある"
  Logs ||--o{ Events : "一つのlogに複数のeventを持つ"

  Users {
    int id PK "保護者ID"
    string name "保護者名"
    string tel "保護者電話番号"
    string email "メールアドレス"
    string password "パスワード"
    string photoUrl "保護者アイコン画像URL"
  }
  Children {
    int id PK "こどもID"
    int parentId FK "保護者ID：Users.id"
    string name "こども名"
    string nameKana "こども名かな"
    date birthday "こども誕生日"
    int classId FK "クラスID：Classes.id"
    string allergens "アレルギー食物"
    string milk_amount "1回にあげるミルクの量"
    string milk_interval "ミルクをあげる間隔"
    string photoUrl "こどもアイコン画像URL"
  }
  Facilities {
    int id PK "施設ID"
    string name "施設名"
  }
  Classes {
    int id PK "クラスID"
    string name "クラス名"
    int facilityId FK "施設ID：Facilities.id"  // 外部キーを明記することで属性の完全性が向上
  }
  Managers {
    int id PK "管理者ID"
    string name "管理者名"
    string email "管理者メールアドレス"
  }
  Staffs {
    int id PK "スタッフID"
    string name "スタッフ名"
    string email "スタッフメールアドレス"
    int facilityId FK "施設ID：Facilities.id"
    int classId FK "クラスID：Classes.id"
  }
  Posts {
    int id PK "投稿ID"
    int childId FK "こどもID：Children.id"
    int parentId FK "保護者ID：Users.id"
    date postDay "登園日"
    string pickUpPerson "今日のお迎え担当"
    string temperature "今日の体温"
    string messages "今日の注意点・指示・昨日・登園前の様子"
    boolean medicationRequired "投薬の有無"
    string typeOfMedication "薬の種類（粉・液・塗り薬）"
    string timingOfMedication "投薬するタイミング"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }
  Logs {
    int id PK "ログID"
    int postId FK "投稿ID：Posts.id"
    string scenes "本日の保育中の様子"
    string photoUrl "保育画像URL"
    string staff "担当スタッフ"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }
  Events {
    int id PK "イベントID"
    int logId FK "ログID：Logs.id"
    timestamp eventOccurrenceTime "イベント発生時間"
    string title "イベントタイトル"
    string details "イベント内容"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }
```