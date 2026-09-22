// 커뮤니티 페이지 기본 뼈대
// 9/14 - 페이지 구조(제목 + 목록) 잡아두기
// 9/16 - api 연결, 데이터 불러오기 구현
// 9/20 - 가격 티어(저렴/일반/프리미엄) 필터 추가
// 9/21 - 커뮤니티 목록(GET /travels) 조회 로직 복구

import { useState, useEffect, useMemo } from "react"
import type { TravelCard } from "../../../entities/travel/model/types"
import { api } from "../../../shared/api/axiosInstance"
import TravelDetailModal from "../../../widgets/travel-detail-modal/ui/TravelDetailModal"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import TravelCardItem from "./TravelCardItem"
import RangeSlider from "../../../shared/ui/RangeSlider"
import { getPriceTier } from '../../../entities/user/model/getPriceTier'

const MAX_BUDGET = 10000000

// 비로그인 사용자에게 블러 처리해서 보여줄 미리보기용 목데이터
// userId: -1은 실제 존재하지 않는 유저이므로, TravelCardItem 쪽에서
// userId > 0일 때만 작성자 정보를 조회하도록 가드가 되어있는지 확인 필요
const MOCK_PREVIEW_CARDS: TravelCard[] = [
  { id: -1, name: '제주 힐링 여행', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-01', endDate: '2026-10-03', totalBudget: 350000, updatedAt: '2026-01-01T00:00:00' },
  { id: -2, name: '부산 바다 여행', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-05', endDate: '2026-10-06', totalBudget: 180000, updatedAt: '2026-01-01T00:00:00' },
  { id: -3, name: '경주 역사 탐방', userId: -1, originalId: null, status: 'COMPLETED', saveCount: 0, edited: false, travelImage: null, startDate: '2026-10-10', endDate: '2026-10-12', totalBudget: 220000, updatedAt: '2026-01-01T00:00:00' },
]

export default function CommunityPage() {

  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, MAX_BUDGET])

  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(null)
  const [travels, setTravels] = useState<TravelCard[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 가격 티어 - 로그인한 사용자의 기준값 (기본값은 API 응답 오기 전 임시값)
  const [cheapThreshold, setCheapThreshold] = useState(30)
  const [premiumThreshold, setPremiumThreshold] = useState(100)
  const [selectedTier, setSelectedTier] = useState<'전체' | '저렴' | '일반' | '프리미엄'>('전체')

  const displayedTravels = isLoggedIn
    ? travels.filter((t) => !(t.originalId !== null && !t.edited))
    : MOCK_PREVIEW_CARDS

  const searchedTravels = useMemo(() => {
    let result = displayedTravels

    if (selectedTier !== '전체') {
      result = result.filter((travel) =>
        getPriceTier(travel.totalBudget, cheapThreshold, premiumThreshold) === selectedTier
      )
    }

    if (searchQuery.trim()) {
      result = result.filter((travel) =>
        travel.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    }

    result = result.filter((travel) =>
      travel.totalBudget >= budgetRange[0] && travel.totalBudget <= budgetRange[1]
    )

    // 최근 생성/수정된 순서로 정렬 (내림차순)
    return [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [displayedTravels, searchQuery, budgetRange, selectedTier, cheapThreshold, premiumThreshold])

  // 로그인한 사용자만 커뮤니티에 올라온 여행 목록을 가져옴
  // (비로그인은 위쪽 MOCK_PREVIEW_CARDS로 블러 미리보기만 보여줌)
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchTravels = async () => {
      try {
        const response = await api.get('/travels')
        setTravels(response.data)
      } catch (error) {
        console.error('커뮤니티 여행 목록 조회 실패', error)
      }
    }
    fetchTravels()
  }, [isLoggedIn])

  // 로그인한 사용자의 가격 기준값 불러오기
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchThresholds = async () => {
      try {
        const response = await api.get('/users/me')
        setCheapThreshold(response.data.cheapThreshold)
        setPremiumThreshold(response.data.premiumThreshold)
      } catch (error) {
        console.error('가격 기준 조회 실패', error)
      }
    }
    fetchThresholds()
  }, [isLoggedIn])

  return (
    <div className="min-h-screen bg-pure-white">
      <div className="max-w-[1200px] mx-auto px-10 py-16">
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
          <p className="text-gray-500 mb-6">다른 여행자들의 여행을 둘러보고 마음에 드는 여행을 저장하세요!</p>

          <div className="flex flex-col md:flex-row md:items-center max-w-2xl bg-pure-white border border-pebble rounded-input px-6 py-3 focus-within:border-deep-ink transition-colors">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="여행 이름으로 검색"
              className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-ash-light outline-none focus:ring-0"
            />

            <div className="border-t md:border-t-0 md:border-l border-pebble my-3 md:my-0 md:mx-6 md:h-8" />

            <div className="flex-1 min-w-0">
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

          {/* 가격 등급 필터 - 검색바 밖으로 분리, 자체 줄 */}
          <div className="flex gap-2 mt-4">
            {(['전체', '저렴', '일반', '프리미엄'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-1.5 text-sm rounded-pill border cursor-pointer ${selectedTier === tier
                  ? 'bg-deep-ink text-pure-white border-deep-ink'
                  : 'border-pebble text-cool-ash'
                  }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isLoggedIn ? 'blur-sm pointer-events-none select-none' : ''}`}>
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
              <button onClick={() => navigate('/login')} className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold">
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
    </div>
  )
}