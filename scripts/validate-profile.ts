import { parentProfileFormSchema } from '../src/lib/validations/profile'

console.log('🧪 保護者プロフィール型定義テスト開始\n')

// ✅ 成功ケース
const validData = {
  name: '山田花子',
  nameKana: 'ヤマダハナコ',
  tel: '090-1234-5678',
  photoUrl: '',
  children: [
    {
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      birthday: '2020-04-01',
      classId: 'class-123',
      allergens: '卵、乳製品',
      milkAmount: '200ml',
      milkInterval: '3時間',
      photoUrl: ''
    }
  ]
}

// ❌ 失敗ケース
const invalidData = {
  name: '', // 必須エラー
  nameKana: 'invalid123', // カナ以外エラー
  tel: '090-123', // 短すぎるエラー
  photoUrl: '',
  children: [] // 最低1人エラー
}

function testValidation() {
  // 成功テスト
  const validResult = parentProfileFormSchema.safeParse(validData)
  console.log('✅ 正常データ:', validResult.success ? 'PASS' : 'FAIL')
  
  if (!validResult.success) {
    console.error('予期しないエラー:', validResult.error.flatten().fieldErrors)
    return false
  }

  // 失敗テスト
  const invalidResult = parentProfileFormSchema.safeParse(invalidData)
  console.log('❌ 異常データ:', invalidResult.success ? 'FAIL（エラー検出できず）' : 'PASS（正しくエラー検出）')
  
  if (!invalidResult.success) {
    console.log('期待通りのバリデーションエラー:')
    const errors = invalidResult.error.flatten().fieldErrors
    Object.entries(errors).forEach(([field, messages]) => {
      console.log(`  - ${field}: ${messages?.[0]}`)
    })
  }

  return validResult.success && !invalidResult.success
}

// メイン実行
const success = testValidation()
console.log(`\n📊 総合結果: ${success ? '✅ PASS' : '❌ FAIL'}`)
console.log(success ? '次のステップ（Server Actions実装）に進んでください。' : '型定義を確認してください。')

process.exit(success ? 0 : 1)
