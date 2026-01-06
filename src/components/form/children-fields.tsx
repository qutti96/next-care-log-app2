'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, User as UserIcon } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/contexts/AuthContext'
import type { ParentProfileFormValues } from '@/lib/validations/profile'

export function ChildrenFields() {
  const { user, loading } = useAuth() // ★ 追加：AuthContextからuser取得

  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext<ParentProfileFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children'
  })

  const addChild = () => {
    append({
      name: '',
      nameKana: '',
      birthday: '',
      classId: '',
      allergens: '',
      milkAmount: null,
      milkInterval: null,
      photoUrl: ''
    })
  }

  // 子どもの名前を監視（動的なタイトル表示用）
  const watchedChildren = watch('children')

  // ★ 追加：認証状態のエラーハンドリング
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">認証情報を確認中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-red-500 text-center py-8">
        認証が必要です。ログインしてください。
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">お子さま情報</h3>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {fields.length}人
          </span>
        </div>
        <Button 
          type="button" 
          onClick={addChild} 
          size="sm"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          お子さまを追加
        </Button>
      </div>

      {/* 子ども情報カード一覧 */}
      {fields.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              まだお子さまの情報が登録されていません
            </p>
            <Button 
              type="button" 
              onClick={addChild}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              最初のお子さまを追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    {watchedChildren?.[index]?.name ? (
                      <span className="text-gray-900">{watchedChildren[index].name}</span>
                    ) : (
                      <span className="text-gray-400">お子さま {index + 1}</span>
                    )}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* プロフィール画像 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    お子さまの写真
                  </Label>
                  <div className="mt-2">
                    <ImageUpload
                      value={watchedChildren?.[index]?.photoUrl || ''}
                      onChange={(url) => setValue(`children.${index}.photoUrl`, url)}
                      userId={user?.id||''}
                      bucketName="profiles"
                      className="w-24 h-24"
                    />
                  </div>
                </div>

                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`children.${index}.name`} className="text-sm font-medium text-gray-700">
                      氏名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register(`children.${index}.name`)}
                      placeholder="山田 太郎"
                      className="mt-1"
                    />
                    {errors.children?.[index]?.name && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.children[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`children.${index}.nameKana`} className="text-sm font-medium text-gray-700">
                      氏名カナ
                    </Label>
                    <Input
                      {...register(`children.${index}.nameKana`)}
                      placeholder="ヤマダ タロウ"
                      className="mt-1"
                    />
                    {errors.children?.[index]?.nameKana && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.children[index]?.nameKana?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 詳細情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`children.${index}.birthday`} className="text-sm font-medium text-gray-700">
                      生年月日
                    </Label>
                    <Input
                      {...register(`children.${index}.birthday`)}
                      type="date"
                      className="mt-1"
                    />
                    {errors.children?.[index]?.birthday && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.children[index]?.birthday?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`children.${index}.allergens`} className="text-sm font-medium text-gray-700">
                      アレルギー
                    </Label>
                    <Input
                      {...register(`children.${index}.allergens`)}
                      placeholder="卵、乳製品"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`children.${index}.classId`} className="text-sm font-medium text-gray-700">
                      所属クラス
                    </Label>
                    <Input
                      {...register(`children.${index}.classId`)}
                      placeholder="ひまわり組"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* ミルク情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`children.${index}.milkAmount`} className="text-sm font-medium text-gray-700">
                      1回のミルク量
                    </Label>
                    <Input
                      {...register(`children.${index}.milkAmount`)}
                      placeholder="200ml"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`children.${index}.milkInterval`} className="text-sm font-medium text-gray-700">
                      ミルクの間隔
                    </Label>
                    <Input
                      {...register(`children.${index}.milkInterval`)}
                      placeholder="3時間"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* フォーム全体のエラー表示 */}
      {errors.children?.root && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {errors.children.root.message}
          </p>
        </div>
      )}

      {/* 追加のガイダンス */}
      {fields.length > 0 && fields.length < 5 && (
        <div className="text-center">
          <Button 
            type="button" 
            onClick={addChild}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            さらにお子さまを追加（最大5人まで）
          </Button>
        </div>
      )}
    </div>
  )
}