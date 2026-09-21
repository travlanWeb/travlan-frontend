// 커뮤니티 페이지 기본 뼈대
// 9/14 - 페이지 구조(제목 + 목록) 잡아두기
// 9/16 - api 연결, 데이터 불러오기 구현
// 9/20 - 

import { useState, useEffect, useMemo } from "react"
import type { TravelCard } from "../../../entities/travel/model/types"
import { api } from "../../../shared/api/axiosInstance"
import TravelDetailModal from "../../../widgets/travel-detail-modal/ui/TravelDetailModal"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import TravelCardItem from "./TravelCardItem"
import RangeSlider from "../../../shared/ui/RangeSlider"

// 슬라이더용 max budget 선언
const MAX_BUDGET = 10000000


export default function CommunityPage() {

  // 슬라이더용
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, MAX_BUDGET])

  // 비로그인 시 보여줄 더미 카드 (실제 데이터 아님, 블러 미리보기 전용)
  const MOCK_PREVIEW_CARDS: TravelCard[] = [
    { id: -1, name: '제주 힐링 여행', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-01', endDate: '2026-10-03', totalBudget: 350000, updatedAt: '2026-01-01T00:00:00' },
    { id: -2, name: '부산 바다 여행', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-05', endDate: '2026-10-06', totalBudget: 180000, updatedAt: '2026-01-01T00:00:00' },
    { id: -3, name: '경주 역사 탐방', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-10', endDate: '2026-10-12', totalBudget: 220000, updatedAt: '2026-01-01T00:00:00' },
  ]
  
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(null) // modal
  const [travels, setTravels] = useState<TravelCard[]>([]) // 받아온 데이터 담기
  const [searchQuery, setSearchQuery] = useState('') // 검색 기능 추가


  const displayedTravels = isLoggedIn ? travels : MOCK_PREVIEW_CARDS

  const searchedTravels = useMemo(() => {
    let result = displayedTravels

    if (searchQuery.trim()) {
      result = result.filter((travel) =>
        travel.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    }

    result = result.filter((travel) =>
      travel.totalBudget >= budgetRange[0] && travel.totalBudget <= budgetRange[1]
    )

    return result
  }, [displayedTravels, searchQuery, budgetRange])


  useEffect(() => {
    if (!isLoggedIn) return // 로그인 안 됐으면 애초에 API 호출 안 함 (401 방지)

    const fetchTravels = async () => {
      try {
        const response = await api.get('/travels')
        const sortedTravels = [...response.data].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setTravels(sortedTravels)
      } catch (error) {
        console.error('여행지 목록 조회 실패', error)
      }
    }
    fetchTravels()
  }, [isLoggedIn])

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-16">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
        <p className="text-gray-500 mb-6">다른 여행자들의 여행을 둘러보고 마음에 드는 여행을 저장하세요!</p>

        <div className="flex flex-col gap-4 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="여행 이름으로 검색"
            className="border border-pebble px-4 py-2 text-sm w-72"
          />
          <RangeSlider
            min={0}
            max={MAX_BUDGET}
            step={10000}
            value={budgetRange}
            onChange={setBudgetRange}
            formatLabel={(v) => `${v.toLocaleString()}원`}
          />
        </div>
      </div>

      <div className="relative">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!isLoggedIn ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {searchedTravels.map((travel) => (
            <TravelCardItem
              key={travel.id}
              travel={travel}
              onClick={() => setSelectedTravelId(travel.id)}
            />
          ))}
        </div>

        {!isLoggedIn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => navigate('/login')} className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold shadow-lg">
              로그인하고 더 보기
            </button>
          </div>
        )}
      </div>

      <TravelDetailModal
        travelId={isLoggedIn ? selectedTravelId : null}
        onClose={() => setSelectedTravelId(null)}
        onNavigateToOriginal={(originalId) => setSelectedTravelId(originalId)}
      />
    </div>
  )
}