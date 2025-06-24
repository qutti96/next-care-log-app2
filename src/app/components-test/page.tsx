import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'

export default function ComponentsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">shadcn/ui コンポーネントテスト</h1>
          <p className="text-muted-foreground">CareLogアプリで使用するコンポーネントの動作確認</p>
        </div>

        <Separator />

        {/* ボタンテスト */}
        <Card>
          <CardHeader>
            <CardTitle>ボタンコンポーネント</CardTitle>
            <CardDescription>登園連絡アプリで使用するボタンバリエーション</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>保護者ログイン</Button>
            <Button variant="secondary">スタッフログイン</Button>
            <Button variant="outline">登園連絡作成</Button>
            <Button variant="destructive">削除</Button>
            <Button variant="ghost">キャンセル</Button>
          </CardContent>
        </Card>

        {/* フォームテスト */}
        <Card>
          <CardHeader>
            <CardTitle>フォームコンポーネント</CardTitle>
            <CardDescription>登園連絡フォームで使用する入力要素</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="子どもの名前を入力" />
            <Input type="email" placeholder="メールアドレス" />
            <Input type="password" placeholder="パスワード" />
          </CardContent>
        </Card>

        {/* バッジテスト */}
        <Card>
          <CardHeader>
            <CardTitle>ステータスバッジ</CardTitle>
            <CardDescription>登園状況を表示するバッジ</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>登園</Badge>
            <Badge variant="secondary">欠席</Badge>
            <Badge variant="destructive">遅刻</Badge>
            <Badge variant="outline">早退</Badge>
          </CardContent>
        </Card>

        {/* アバターテスト */}
        <Card>
          <CardHeader>
            <CardTitle>プロフィール画像</CardTitle>
            <CardDescription>子どもや保護者のプロフィール表示</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>田中</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>佐藤</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {/* アラートテスト */}
        <Alert>
          <AlertTitle>システム通知</AlertTitle>
          <AlertDescription>
            shadcn/uiコンポーネントが正常に動作しています。CareLogアプリの開発準備が完了しました！
          </AlertDescription>
        </Alert>

        {/* ナビゲーション */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Link href="/">
              <Button variant="outline">トップページに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
