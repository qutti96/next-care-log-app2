// src/components/ui/image-upload.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // ← 最新版のパス
import { uploadAvatarFile, getSignedAvatarUrlClient } from '@/lib/storage';
import type { ImageUploadResult } from '@/types/storage';

interface ImageUploadProps {
  /**
   * storage path (例: "userId/filename.ext") または 署名付きURL
   * 非公開バケットのため、storage pathから表示用署名付きURLを生成
   */
  value?: string;
  /**
   * アップロード完了時にstorage pathを親コンポーネントに通知
   */
  onChange: (path: string | undefined) => void;
  /**
   * 現在のユーザーID (RLSポリシーとパス生成に使用)
   */
  userId: string;

  /**
   * Supabase Storageのバケット名
   */
  bucketName?: string; // ★ 追加（オプショナルで既存コードとの互換性確保）
  /**

  /**
   * コンポーネントの無効化状態
   */
  disabled?: boolean;
  /**
   * 追加のCSSクラス
   */
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  userId,
  bucketName = 'avatars',
  disabled = false,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | undefined>();
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { toast } = useToast();

  // valueの変化に応じて表示用URLを生成
  useEffect(() => {
    let active = true;

    const loadDisplayUrl = async () => {
      if (!value) {
        setDisplayUrl(undefined);
        return;
      }

      // 既に署名付きURLの場合はそのまま使用
      if (value.startsWith('http')) {
        setDisplayUrl(value);
        return;
      }

      // storage pathの場合は署名付きURLを生成
      setIsLoadingPreview(true);
      try {
        const signedUrl = await getSignedAvatarUrlClient(value);
        if (active) {
          setDisplayUrl(signedUrl);
        }
      } catch (error) {
        console.warn('Failed to generate signed URL:', error);
        if (active) {
          setDisplayUrl(undefined);
          toast({
            title: '画像の読み込みに失敗しました',
            description: 'プロフィール画像の表示に問題が発生しました',
            variant: 'destructive',
          });
        }
      } finally {
        if (active) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadDisplayUrl();

    return () => {
      active = false;
    };
  }, [value, toast]);

  const handleUpload = useCallback(async (file: File) => {
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      // uploadAvatarFile内でバリデーション実行
      const result: ImageUploadResult = await uploadAvatarFile(userId, file);
      
      // 表示用署名付きURL生成
      const signedUrl = await getSignedAvatarUrlClient(result.path);
      
      // 状態更新
      setDisplayUrl(signedUrl);
      onChange(result.path); // storage pathを親に通知
      
      // ✅ 成功通知
      toast({
        title: '画像をアップロードしました',
        description: 'プロフィール画像が更新されました',
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // ❌ エラー通知
      toast({
        title: 'アップロードに失敗しました',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [userId, onChange, disabled, toast]);

  const handleRemove = useCallback(() => {
    setDisplayUrl(undefined);
    onChange(undefined);
    
    toast({
      title: '画像を削除しました',
      description: 'プロフィール画像が削除されました',
    });
  }, [onChange, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // 同じファイルの再選択を可能にするため値をクリア
    event.target.value = '';
  }, [handleUpload]);

  const uniqueId = `avatar-upload-${userId}`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* プレビュー画像エリア */}
        <div className="relative">
          {displayUrl ? (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-sm">
              <Image
                src={displayUrl}
                alt="プロフィール画像"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized // Supabase署名付きURLとの互換性のため
                onError={() => {
                  console.warn('Failed to load image:', displayUrl);
                  setDisplayUrl(undefined);
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              {isUploading || isLoadingPreview ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
          )}
          
          {/* 削除ボタン */}
          {displayUrl && !isUploading && !isLoadingPreview && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="画像を削除"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* アップロードコントロール */}
        <div className="flex-1 space-y-2">
          <label htmlFor={uniqueId}>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading}
              asChild
              className="w-full cursor-pointer"
            >
              <span className="flex items-center justify-center space-x-2">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>アップロード中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>{displayUrl ? '画像を変更' : '画像を選択'}</span>
                  </>
                )}
              </span>
            </Button>
          </label>
          
          <input
            id={uniqueId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />
          
          {/* ヘルプテキスト */}
          <p className="text-xs text-gray-500 text-center">
            JPG、PNG、WebP形式、5MB以下
          </p>
        </div>
      </div>

      {/* アップロード進行状況 */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse transition-all duration-300" style={{ width: '70%' }} />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
