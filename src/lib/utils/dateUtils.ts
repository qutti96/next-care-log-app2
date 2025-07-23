// lib/utils/dateUtils.ts
import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 生年月日から月齢を計算する
 * @param birthDate 生年月日
 * @param baseDate 基準日（省略時は現在日時）
 * @returns 月齢の文字列表現（例: "0歳8ヶ月"）
 */
export function calculateAge(birthDate: Date, baseDate: Date = new Date()): string {
  const years = differenceInYears(baseDate, birthDate);
  const months = differenceInMonths(baseDate, birthDate) % 12;

  if (years === 0) {
    return `${months}ヶ月`;
  } else if (months === 0) {
    return `${years}歳`;
  } else {
    return `${years}歳${months}ヶ月`;
  }
}

/**
 * 生年月日から詳細な月齢情報を取得する
 * @param birthDate 生年月日
 * @returns 詳細な月齢情報
 */
export function getDetailedAge(birthDate: Date) {
  const baseDate = new Date();
  const years = differenceInYears(baseDate, birthDate);
  const totalMonths = differenceInMonths(baseDate, birthDate);
  const months = totalMonths % 12;
  
  return {
    years,
    months,
    totalMonths,
    displayText: calculateAge(birthDate, baseDate),
    isInfant: totalMonths < 12, // 0歳児判定
    isToddler: totalMonths >= 12 && totalMonths < 36, // 1-2歳児判定
  };
}

/**
 * 生年月日を日本語形式でフォーマット
 * @param date 日付
 * @returns フォーマットされた日付文字列
 */
export function formatBirthDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
}
