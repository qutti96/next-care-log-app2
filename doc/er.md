# ER図（Markdown形式）

## User

- id (PK)
- name
- tel
- email (UNIQUE)
- password
- photoUrl
- children → [Child]
- posts → [Post]

## Child

- id (PK)
- parentId (FK → User.id)
- name
- nameKana
- birthday
- allergens
- milk
- photoUrl
- posts → [Post]

## Facility

- id (PK)
- name
- classes → [Class]
- managers → [Manager]
- staff → [Staff]

## Class

- id (PK)
- name
- facilityId (FK → Facility.id)
- staff → [Staff]

## Manager

- id (PK)
- name
- email (UNIQUE)
- facilityId (FK → Facility.id)

## Staff

- id (PK)
- name
- email (UNIQUE)
- facilityId (FK → Facility.id)
- classId (FK → Class.id)

## Post

- id (PK)
- childId (FK → Child.id)
- parentId (FK → User.id)
- postDay
- pickUpPerson
- temperature
- messages
- medicationRequired
- typeOfMedication
- timingOfMedication
- log → Log (1:1)
- createdAt
- updatedAt
- deletedAt

## Log

- id (PK)
- postId (FK, UNIQUE → Post.id)
- scenes
- photoUrl
- staff
- events → [Event]
- createdAt
- updatedAt
- deletedAt

## Event

- id (PK)
- logId (FK → Log.id)
- eventOccurrenceTime
- title
- details
- createdAt
- updatedAt
- deletedAt

## ER画像（Mermaid形式）
```mermaid
erDiagram
  users ||--o{ children : "1人のuserは1以上のchildrenを持つ"
  facility ||--o{ manager : "facilityは1以上のmanagerがいる"
  facility ||--o{ classEntity : "facilityは1以上のclassを持つ"
  children ||--o{ posts : "一人のchildrenは複数のpostsを持つ" 
  posts ||--|| logs : "一つのpostsに一つのlogsがある"
  logs ||--o{ events : "一つの記録に複数のeventを持つ"

  users {
    int id PK "保護者ID"
    string name "保護者名"
    string tel "保護者電話番号"
    string email "メールアドレス"
    string pwd "パスワード"
    string photoUrl "保護者アイコン画像URL"
  }
  children {
    int id PK "こどもID"
    int parentId FK "保護者ID：users.id"
    string name "こども名"
    string nameKana "こども名かな"
    date birthday "こども誕生日"
    string allergens "アレルギー食物"
    string milk "1回にあげるミルクの量"
    string photoUrl "こどもアイコン画像URL"
  }
  facility {
    int id PK "施設ID"
    string name "クラス名"
  }
  classEntity {
    int id PK "クラスID"
    string name "クラス名"
  }
  manager {
    int id PK "施設ID"
    string name "クラス名"
    string email "メールアドレス"
  }
  posts {
    int id PK "投稿ID"
    int childrenID FK "こどもID"
    int parentId FK "保護者ID：users.id"
    date postDay "登園日"
    string pickUpPerson "今日のお迎え担当"
    string temperature "今日の体温"
    string messages "今日の注意点・指示・昨日・登園前の様子"
    boolean medicationRequired "投薬の有無"
    string typeOfMedication "薬の種類（粉・液・塗り薬）"
    string timingOfmedication "投薬するタイミング"
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }
  logs {
    int id PK "ID"
    date postDay FK "posts.postday 記録日"
    string Scenes "本日の保育中の様子"
    string photoUrl "保育画像URL"
    string staff "担当スタッフ"
  }
  events {
    int id PK "ID"
    date postDay FK "posts.postday 記録日"
    date eventOccuranceTime "イベント発生時間"
    string title "イベントタイトル"
    string details "イベント内容"
  }
```