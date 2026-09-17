// 커뮤니티 페이지 기본 뼈대
// 9/14 - 페이지 구조(제목 + 목록) 잡아두기
// 9/16 - api 연결, 데이터 불러오기 구현

import { useState, useEffect } from "react"
import type { TravelCard } from "../../../entities/travel/model/types"
import { api } from "../../../shared/api/axiosInstance"
import TravelDetailModal from "../../../widgets/travel-detail-modal/ui/TravelDetailModal"


export default function CommunityPage() {

  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(null) // modal

  const [travels, setTravels] = useState<TravelCard[]>([]) // 받아온 데이터 담기

  useEffect(() => {
    // 컴포넌트 화면에 나타나면 api 호출, 데이터 가져옴
    const fetchTravels = async () => {
      try {
        const response = await api.get('/travels') // 응답 받아오기

        // 기본 - 최신순으로 정렬해서 보여줌
        const sortedTravels = [...response.data].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )

        setTravels(sortedTravels)
      } catch (error) {
        console.error('여행지 목록 조회 실패', error)
      }
    }
    fetchTravels()
  }, []) // 페이지 열릴 때 한 번만 실행


  return (
    <div className="max-w-[1200px] mx-auto px-10 py-16">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
        <p className="text-gray-500">다른 여행자들의 여행을 둘러보고 마음에 드는 여행을 저장하세요!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {travels.map((travel) => (
          <div
          onClick={() => setSelectedTravelId(travel.id)} 
          key={travel.id} className="border border-gray-200 rounded-flat p-4">
            <h3 className="font-semibold text-deep-ink mb-1">{travel.name}</h3>
            <p className="text-sm text-gray-500 mb-1">
              {travel.startDate} ~ {travel.endDate}
            </p>
            <p className="text-sm font-medium">
              예산 {travel.totalBudget.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
      
      <TravelDetailModal travelId={selectedTravelId} onClose={() => setSelectedTravelId(null)}/>
    </div>
  )
}