'use client';
//ChildrenFieldsコンポーネント実装
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UserProfileFormInput } from '@/lib/validations/profile';

interface ChildrenFieldsProps {
  form: UseFormReturn<UserProfileFormInput>;
}

export function ChildrenFields({ form }: ChildrenFieldsProps) {
  const { control, formState: { errors } } = form;

  // useFieldArrayでお子さま配列を管理
  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  // お子さま追加（tempIdで一意性確保）
  const addChild = () => {
    append({ name: '', tempId: `temp_${Date.now()}` });
  };

  // お子さま削除（最低1人必須）
  const removeChild = (index: number) => {
    if (fields.length <= 1) {
      return; // Zodバリデーションと連動
    }
    remove(index);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-gray-50">
      <Label className="text-base font-semibold text-gray-800">
        お子さまの情報 <span className="text-red-500">*</span>
      </Label>
      <p className="text-sm text-gray-600">
        最低1人のお子さまの氏名を入力してください。
      </p>

      {/* 動的フィールドレンダリング */}
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end space-x-2">
          <FormField
            control={control}
            name={`children.${index}.name`}
            render={({ field: inputField }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  お子さま{index + 1}の氏名
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="山田太郎"
                    {...inputField}
                  />
                </FormControl>
                <FormMessage>
                  {errors.children?.[index]?.name?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          
          {/* 削除ボタン（2人以上の場合のみ） */}
          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeChild(index)}
              className="mb-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`お子さま${index + 1}を削除`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      {/* 追加ボタン */}
      <Button
        type="button"
        variant="outline"
        onClick={addChild}
        className="w-full mt-4 flex items-center space-x-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        aria-label="お子さまを追加"
      >
        <Plus className="h-4 w-4" />
        <span>お子さまを追加</span>
      </Button>
      
      {/* 全体エラーメッセージ */}
      {errors.children?.message && (
        <p className="text-sm font-medium text-red-500 mt-2">
          {errors.children.message}
        </p>
      )}
    </div>
  );
}