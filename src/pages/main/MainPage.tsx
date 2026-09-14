// useState: 컴포넌트 안에서 바뀌는 값을 다루는 React의 가장 기본적인 훅
// 여기서는 "지금 선택된 여행지가 무엇인지"를 이 페이지 안에서만 기억하면 되므로
// (다른 페이지/컴포넌트가 공유할 필요 없음) Zustand가 아니라 useState로 충분함
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Place } from '../../entities/place/model/types'
import { mockPlaces } from '../../entities/place/model/mockPlaces'
import PlaceListItem from '../../entities/place/ui/PlaceListItem'
import PlaceDetail from '../../entities/place/ui/PlaceDetail'
import BagPanel from '../../widgets/bag-panel/BagPanel'
import { useBagStore } from '../../entities/bag/model/useBagStore'

export default function MainPage() {
  const navigate = useNavigate()

  // 지금 선택된 장소. 처음엔 아무것도 선택 안 된 상태(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // 타임라인으로 보내기 버튼에서 여행가방 내용이 비어있는지 확인하기 위해 구독
  const bagItems = useBagStore((state) => state.items)

  // "타임라인으로 보내기" 버튼 클릭 시 실행
  // 지금은 실제 데이터 전달 로직(API 저장 등)이 없어서 페이지 이동만 함
  // TODO: 백엔드 연동 후 - 여행가방 내용을 실제로 timeline(visits)에 등록하는 API 호출 필요
  const handleSendToTimeline = () => {
    navigate('/timeline')
  }

  return (
    <div className="p-8 flex gap-6">
      {/* 지도 자리 - 실제 지도 라이브러리는 나중에 붙임.
          지금은 목록 클릭 방식이라 화면 비중을 줄여서 배치 */}
      <div className="w-72 bg-gray-100 rounded-card flex items-center justify-center text-gray-400 text-sm">
        지도 영역 (준비 중)
      </div>

      {/* 여행지 목록 - 클릭하면 selectedPlace만 바뀜, 담기 버튼 없음 */}
      <div className="w-64 flex flex-col gap-2">
        <h2 className="font-semibold mb-1">여행지 목록</h2>
        {mockPlaces.map((place) => (
          <PlaceListItem
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onClick={() => setSelectedPlace(place)}
          />
        ))}
      </div>

      {/* 여행지 상세 - 담기 버튼이 여기 있음 */}
      <div className="w-72">
        <h2 className="font-semibold mb-2">상세 정보</h2>
        <PlaceDetail place={selectedPlace} />
      </div>

      {/* 여행가방 + 타임라인으로 보내기 버튼 */}
      <div className="flex flex-col gap-4">
        <BagPanel />
        <button
          onClick={handleSendToTimeline}
          disabled={bagItems.length === 0}
        >
          타임라인으로 보내기
        </button>
      </div>
    </div>
  )
}