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
import { usePriceTierStore } from '../../../entities/user/model/usePriceTierStore'
import { getPriceTier } from '../../../entities/user/model/getPriceTier'

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

  // 가격 티어
  const cheapMax = usePriceTierStore((state) => state.cheapMax)
  const premiumMin = usePriceTierStore((state) => state.premiumMin)
  const [selectedTier, setSelectedTier] = useState<'전체' | '저렴' | '일반' | '프리미엄'>('전체')


  const displayedTravels = isLoggedIn ? travels : MOCK_PREVIEW_CARDS

  const searchedTravels = useMemo(() => {
    let result = displayedTravels

    if (selectedTier !== '전체') {
      result = result.filter((travel) =>
        getPriceTier(travel.totalBudget, cheapMax, premiumMin) === selectedTier
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
    // 최상위 배경 = 흰색(bg-pure-white)으로 되돌림. min-h-screen은 유지해서 콘텐츠가 짧아도 화면 전체를 채움.
    <div className="min-h-screen bg-pure-white">
      <div className="max-w-[1200px] mx-auto px-10 py-16">
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
          <p className="text-gray-500 mb-6">다른 여행자들의 여행을 둘러보고 마음에 드는 여행을 저장하세요!</p>

          {/* 검색 + 가격 필터를 하나의 바로 통합.
              그림자 대신 헤어라인 테두리(border-pebble)로 구분하고, radius는 rounded-input(14px)로 통일
              좁은 화면(모바일)에서는 세로로 쌓이고, md 이상에서는 가로로 나란히 배치됨 */}
          <div className="flex flex-col md:flex-row md:items-center max-w-2xl bg-pure-white border border-pebble rounded-input px-6 py-3 focus-within:border-deep-ink transition-colors">
            {/* 이 input은 자체 테두리가 없이 부모(pill 컨테이너) 테두리에 얹혀있는 구조라,
                포커스 스타일도 input이 아니라 부모의 focus-within:border-deep-ink로 표현함 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="여행 이름으로 검색"
              className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-ash-light outline-none focus:ring-0"
            />

            {/* 구분선 - 세로 배치일 땐 가로선, 가로 배치일 땐 세로선으로 바뀜 */}
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

            <div className="flex gap-2 mb-4">
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
        </div>

        <div className="relative">
          {/* 카드 그리드 - 그림자가 퍼질 여유 공간을 위해 gap-6으로 넓힘 */}
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
