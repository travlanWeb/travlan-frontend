import { useState, useEffect } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelCard } from '../../../entities/travel/model/types'

export default function MyPage() {
  const [draftTravels, setDraftTravels] = useState<TravelCard[]>([])

  useEffect(() => {
    const fetchDraftTravels = async () => {
      try {
        const response = await api.get('/travels')
        // status가 DRAFT인 것만 걸러내기 (임시 확인용 - 원래는 userId로도 걸러야 함)
        const drafts = response.data.filter((travel: TravelCard) => travel.status === 'DRAFT')
        setDraftTravels(drafts)
      } catch (error) {
        console.error('임시저장 여행 조회 실패', error)
      }
    }
    fetchDraftTravels()
  }, [])

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-16">
      <h1 className="text-2xl font-bold text-deep-ink mb-6">마이페이지</h1>

      <h2 className="text-deep-ink font-bold mb-3">
        임시저장 여행 <span className="text-cool-ash font-normal">{draftTravels.length}곳</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {draftTravels.map((travel) => (
          <div key={travel.id} className="border border-pebble rounded-flat p-4">
            <h3 className="font-semibold text-deep-ink mb-1">{travel.name}</h3>
            <p className="text-sm text-cool-ash mb-1">
              {travel.startDate} ~ {travel.endDate}
            </p>
            <p className="text-sm font-medium text-deep-ink">
              예산 {travel.totalBudget.toLocaleString()}원
            </p>
            <p className="text-xs text-cool-ash mt-2">상태: {travel.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}