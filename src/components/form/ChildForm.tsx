import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { childFormSchema, ChildFormValues } from '@/lib/validations/child';

interface ChildFormProps {
  onSubmit: (values: ChildFormValues) => void;
}

export function ChildForm({ onSubmit }: ChildFormProps) {
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 生年月日入力フィールド */}
      <div>
        <label>生年月日</label>
        <input
          type="date"
          {...form.register('birthday')}
          className="border rounded px-3 py-2"
        />
        {form.formState.errors.birthday && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.birthday.message}
          </p>
        )}
      </div>

      {/* 他のフィールド */}
      <button type="submit">登録</button>
    </form>
  );
}