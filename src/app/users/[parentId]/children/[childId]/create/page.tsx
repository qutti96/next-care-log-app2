// src/app/users/[parentId]/children/[childId]/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Baby, Save, RotateCcw, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ChildProfileCreatePageProps {
  params: {
    parentId: string
    childId: string
  }
}

interface ChildInitialData {
  id: string
  name: string
  email: string
}

interface ClassOption {
  id: string
  name: string
}

export default function ChildProfileCreatePage({ params }: ChildProfileCreatePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 子ども基本情報（保護者プロフィールから取得）
  const [childData, setChildData] = useState<ChildInitialData | null>(null)
  
  // クラス一覧
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  
  // フォームデータ
  const [formData, setFormData] = useState({
    nameKana: '',
    birthday: '',
    classId: '',
    allergens: '',
    milkAmount: '',
    milkInterval: '',
  })
  
  // 画像関連
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // 初期データの取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 子ども基本情報の取得
        const childResponse = await fetch(`/api/users/${params.parentId}/children/${params.childId}`)
        if (childResponse.ok) {
          const child = await childResponse.json()
          setChildData(child)
        }

        // クラス一覧の取得
        const classesResponse = await fetch('/api/classes')
        if (classesResponse.ok) {
          const classes = await classesResponse.json()
          setClassOptions(classes)
        }
      } catch (error) {
        console.error('初期データ取得エラー:', error)
        toast({
          title: 'エラー',
          description: 'データの取得に失敗しました',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [params.parentId, params.childId, toast])

  // 画像ファイル選択
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      
      // プレビュー画像の生成
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = new FormData()
      
      // フォームデータの追加
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      // 画像ファイルの追加
      if (photoFile) {
        submitData.append('photo', photoFile)
      }

      const response = await fetch(`/api/users/${params.parentId}/children/${params.childId}/profile`, {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('登録に失敗しました')
      }

      toast({
        title: '登録完了',
        description: 'お子さまのプロフィールを登録しました',
      })

      // 保護者プロフィール画面に戻る
      router.push(`/users/${params.parentId}`)
    } catch (error) {
      console.error('登録エラー:', error)
      toast({
        title: 'エラー',
        description: '登録に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // フォームリセット
  const handleReset = () => {
    if (confirm('入力内容をリセットしてもよろしいですか？')) {
      setFormData({
        nameKana: '',
        birthday: '',
        classId: '',
        allergens: '',
        milkAmount: '',
        milkInterval: '',
      })
      setPhotoFile(null)
      setPhotoPreview(null)
    }
  }

  // 名前の頭文字取得（アバター用）
  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!childData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">お子さま情報が見つかりません。保護者プロフィールを確認してください。</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        
        {/* ナビゲーション */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${params.parentId}`)}
            className="gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
            保護者プロフィールに戻る
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Baby className="h-6 w-6 text-blue-600" />
              お子さまプロフィール登録
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              保育園での生活に必要な情報を入力してください
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* RDD準拠：表示のみ項目 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                  保護者プロフィール登録情報
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">お子さま氏名</Label>
                    <p className="font-semibold text-gray-800 mt-1">{childData.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">お子さまID</Label>
                    <p className="font-mono text-sm text-gray-600 mt-1">{childData.id}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* プロフィール画像アップロード */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">画像ファイル</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-gray-200">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {getInitial(childData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG形式（最大5MB）
                    </p>
                  </div>
                </div>
              </div>

              {/* 氏名カナ */}
              <div className="space-y-2">
                <Label htmlFor="nameKana" className="text-sm font-medium">
                  氏名カナ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameKana"
                  placeholder="ヤマダ タロウ"
                  value={formData.nameKana}
                  onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
                  required
                />
              </div>

              {/* 生年月日 */}
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-sm font-medium">
                  生年月日 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  required
                />
              </div>

              {/* 所属クラス（ドロップダウン） */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">所属クラス</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="クラスを選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* アレルギー */}
              <div className="space-y-2">
                <Label htmlFor="allergens" className="text-sm font-medium">アレルギー</Label>
                <Textarea
                  id="allergens"
                  placeholder="例：卵、乳製品、小麦（特になければ「なし」と入力）"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  rows={3}
                />
              </div>

              {/* ミルク情報 */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">
                  ミルク情報（乳児の場合）
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="milkAmount" className="text-sm font-medium">
                      1回にあげるミルクの量
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="milkAmount"
                        type="number"
                        placeholder="200"
                        value={formData.milkAmount}
                        onChange={(e) => setFormData({ ...formData, milkAmount: e.target.value })}
                        min="0"
                      />
                      <span className="text-sm text-gray-600">ml</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milkInterval" className="text-sm font-medium">
                      ミルクをあげる間隔
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="milkInterval"
                        placeholder="3時間ごと"
                        value={formData.milkInterval}
                        onChange={(e) => setFormData({ ...formData, milkInterval: e.target.value })}
                      />
                      <span className="text-sm text-gray-600">間隔</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* RDD準拠：登録ボタン・リセットボタン */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 gap-2"
                  disabled={submitting}
                >
                  <RotateCcw className="h-4 w-4" />
                  リセットボタン
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                >
                  <Save className="h-4 w-4" />
                  {submitting ? '登録中...' : '登録ボタン'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
