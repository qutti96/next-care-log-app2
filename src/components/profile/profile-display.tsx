// src/components/profile/profile-display.tsx
// 保護者プロフィール表示コンポーネント（RDD準拠 + 既存コンポーネント完全活用版）

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Phone, 
  Mail, 
  Lock,
  Edit, 
  Baby,
  Home,
  ChevronRight,
  UserPlus,
  AlertTriangle
} from 'lucide-react'

// 🚀 既存コンポーネントとリネーム後のユーティリティのインポート
import { ChildAgeDisplay } from '@/components/ChildAgeDisplay'
import { getDetailedAgeFromString } from '@/lib/utils/childAgeUtils'

import type { ParentProfileFormValues } from '@/lib/validations/profile'

// 子どもプロフィールの型（バリデーションスキーマから推論）
type Child = ParentProfileFormValues['children'][number]

interface ProfileDisplayProps {
  // Next.jsのルート・認証情報から渡される値
  userId: string
  userEmail: string
  // 統一された型定義を使用
  profile: ParentProfileFormValues
}

// 名前の頭文字取得（アバター用）
function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

// 🚀 子どもプロフィール完成度判定関数（保育園アプリに最適化）
function isChildProfileComplete(child: Child): boolean {
  // 保育園アプリで重要な項目のいずれかが設定されていれば「プロフィール登録済み」と判定
  return !!(
    child.nameKana || 
    child.birthday ||     // 年齢計算に必要
    child.classId ||      // クラス所属情報
    child.allergens ||    // 安全管理に重要
    child.milkAmount ||   // 乳児の場合重要
    child.milkInterval || 
    child.photoUrl
  )
}

export function ProfileDisplay({ userId, userEmail, profile }: ProfileDisplayProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        
        {/* ヘッダーアクション */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            ホームに戻る
          </Button>
          
          <Button
            onClick={() => router.push(`/users/${userId}/edit`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            編集ボタン
          </Button>
        </div>

        {/* 保護者情報カード */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              保護者プロフィール
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-2">
            {/* プロフィール画像 */}
            <div className="flex justify-center mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.photoUrl || undefined} alt={profile.name} />
                <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 基本情報（RDD仕様に完全準拠） */}
            <div className="space-y-4 max-w-2xl mx-auto">
              
              {/* 氏名 */}
              <div className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border border-gray-100">
                <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">氏名</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.name}</p>
                </div>
              </div>

              {/* 氏名カナ */}
              <div className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border border-gray-100">
                <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">氏名カナ</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {profile.nameKana || '未設定'}
                  </p>
                </div>
              </div>

              {/* 電話番号 */}
              <div className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border border-gray-100">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">電話番号</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {profile.tel || '未設定'}
                  </p>
                </div>
              </div>

              {/* メールアドレス */}
              <div className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border border-gray-100">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">メールアドレス</p>
                  <p className="text-lg font-semibold text-gray-800">{userEmail}</p>
                </div>
              </div>

              {/* パスワード（RDD仕様：XXXで表示） */}
              <div className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border border-gray-100">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">パスワード</p>
                  <p className="text-lg font-semibold text-gray-800 tracking-widest">••••••••</p>
                  <p className="text-xs text-gray-400 mt-1">
                    セキュリティのため非表示
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 子ども情報カード（RDD仕様 + ChildAgeDisplay完全活用） */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Baby className="h-5 w-5 text-blue-600" />
                お子さま情報
              </CardTitle>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {profile.children.length}人
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {profile.children.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Baby className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">お子さま情報が登録されていません</p>
                <p className="text-sm text-gray-400 mb-6">
                  プロフィール編集画面からお子さまの情報を追加できます
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/users/${userId}/edit`)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  お子さまを追加する
                </Button>
              </div>
              ) : (
                <div className="space-y-4">
                 {profile.children.map((child: Child, index: number) => {
                   // 🚀 既存のgetDetailedAgeFromStringを活用（ChildAgeInfo型を返す）
                   const ageInfo = child.birthday
                     ? getDetailedAgeFromString(child.birthday)
                     : null

                  // 🎯 プロフィール完成度判定
                  const profileComplete = isChildProfileComplete(child)

                   return (
                     <div key={child.id ?? index}>
                      {index > 0 && <Separator className="my-4" />}
                      
                      {/* RDD仕様：子ども1氏名、子ども2氏名の表示 */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* 子どもアバター */}
                          <Avatar className="h-16 w-16 border-2 border-white shadow-md flex-shrink-0">
                            <AvatarImage src={child.photoUrl || undefined} alt={child.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                              {getInitials(child.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* 子ども情報 */}
                          <div className="flex-1">
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                子ども{index + 1} 氏名：{child.name}
                              </h3>
                              {child.nameKana && (
                                <p className="text-sm text-gray-600">{child.nameKana}</p>
                              )}

                              {/* 🚀 プロフィール未登録の場合の注意表示 */}
                              {!profileComplete && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    詳細情報未登録
                                  </Badge>
                                </div>
                              )}

                            </div>
                            
                            {/* 🚀 既存のChildAgeDisplayを完全活用 */}
                            {child.birthday && ageInfo ? (
                              <div className="mb-3">
                                <ChildAgeDisplay 
                                  birthday={new Date(child.birthday)}
                                  age={ageInfo}
                                  showDetailedInfo={true}
                                />
                              </div>
                            ):(
                              <div className="mb-3 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                              誕生日などの詳細情報を登録すると年齢が表示されます
                            </div>
                            )}

                            {/* RDD仕様：子どもプロフィールリンク */}
                            <Button
                              variant={profileComplete ? "outline" : "default"}
                              size="sm"
                              onClick={() => {
                                const targetUrl = profileComplete 
                                  ? `/users-children/${child.id}` 
                                  : `/users-children/${child.id}/create`
                                router.push(targetUrl)
                              }}
                              className={`gap-2 mt-2 ${!profileComplete ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                            >
                              {profileComplete ? (
                                <>
                                子ども{index + 1}プロフィール
                                <ChevronRight className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4" />
                                  子ども{index + 1}プロフィール登録
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
