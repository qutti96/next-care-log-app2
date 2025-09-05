// components/HealthDashboard.tsx
//発熱管理ダッシュボード
'use client'
import { useEffect, useState } from 'react'

interface HealthStats {
  temperatureManagement: {
    statistics: {
      平均体温: string
      最高体温: string
      最低体温: string
      記録総数: string
    }
    feverDetectionCount: number
  }
}

export default function HealthDashboard() {
  const [stats, setStats] = useState<HealthStats | null>(null)
  
  useEffect(() => {
    fetch('/api/final-optimization-verification')
      .then(res => res.json())
      .then(data => setStats(data.results))
  }, [])
  
  if (!stats) return <div>Loading...</div>
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">健康管理ダッシュボード</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold text-blue-800">平均体温</h3>
          <p className="text-2xl text-blue-600">{stats.temperatureManagement.statistics.平均体温}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-semibold text-green-800">記録総数</h3>
          <p className="text-2xl text-green-600">{stats.temperatureManagement.statistics.記録総数}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded">
          <h3 className="font-semibold text-red-800">発熱検知</h3>
          <p className="text-2xl text-red-600">{stats.temperatureManagement.feverDetectionCount}件</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded">
          <h3 className="font-semibold text-orange-800">最高体温</h3>
          <p className="text-2xl text-orange-600">{stats.temperatureManagement.statistics.最高体温}</p>
        </div>
      </div>
    </div>
  )
}
