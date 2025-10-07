// src/app/test-toast/page.tsx（動作確認用）
'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast' // ← 最新版のパス

export default function TestToastPage() {
  const { toast } = useToast()

  const testToast = () => {
    toast({
      title: "動作確認",
      description: "Toastが正常に動作しています！",
    })
  }

  const testError = () => {
    toast({
      title: "エラーテスト",
      description: "エラー通知のテストです",
      variant: "destructive",
    })
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Toast動作確認</h1>
      <div className="space-x-4">
        <Button onClick={testToast}>
          通常Toast
        </Button>
        <Button onClick={testError} variant="destructive">
          エラーToast
        </Button>
      </div>
    </div>
  )
}
