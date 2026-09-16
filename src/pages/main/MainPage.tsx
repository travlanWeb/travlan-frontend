// useState: 컴포넌트 안에서 바뀌는 값을 다루는 React의 가장 기본적인 훅
// 여기서는 "지금 선택된 여행지가 무엇인지"를 이 페이지 안에서만 기억하면 되므로
// (다른 페이지/컴포넌트가 공유할 필요 없음) Zustand가 아니라 useState로 충분함

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Place } from '../../entities/place/model/types'
import { mockPlaces } from '../../entities/place/model/mockPlaces'
import PlaceListItem from '../../entities/place/ui/PlaceListItem'
import PlaceDetail from '../../entities/place/ui/PlaceDetail'
import BagPanel from '../../widgets/bag-panel/BagPanel'
import { useBagStore } from '../../entities/bag/model/useBagStore'
import KakaoMap from '../../widgets/kakao-map/ui/KakaoMap'
import { useEffect } from 'react'
import { mockTravel } from '../../entities/travel/model/mockTravel'
import { useTravelDraftStore } from '../../entities/travel/model/useTravelDraftStore'


export default function MainPage() {

  // 생성 + 입력 게이트 추가
  const { travelId } = useParams()
  const isNewTravel = travelId === 'new' // travel id 가 new 이면 newTravel 확인

  // const [name, setName] = useState('')
  // const [startDate, setStartDate] = useState('')
  // const [endDate, setEndDate] = useState('')
  // const [totalBudget, setTotalBudget] = useState(0)

  // useTravelDraftStore 생성하여 위 코드 대체함 -> 여러 줄 코드 구조분해할당으로 한 줄로 대체함
  const { name, startDate, endDate, totalBudget, setName, setStartDate, setEndDate, setTotalBudget } = useTravelDraftStore()

  // const isFormComplete = name && startDate && endDate && totalBudget // isFormCompleted 일 때만 타임라인으로 넘길 수 있도록 해야 함
  const canProceedToTimeline = name && totalBudget // timeline 으로 넘길 수 있는지 판단하는 함수

  // navigate 파트
  const navigate = useNavigate() // navigate 에 페이지 이동 함수 담기
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null) // 컴포넌트가 화면에 그려질 때마다 React 내부에 값 하나 새로 등록/유지
  const bagItems = useBagStore((state) => state.items) // useBagStore 에서 items 만 가져옴, 다른 컴포넌트에서 addItem 호출해서 뭔가 추가되면 Zustand 가 자동 렌더링, bagItems가 자동 갱신됨 (구독 형태)

  // 정보 수정 상태 useEffect
  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false)

  // formatDate 함수 선언
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    return `${parts[1]}.${parts[2]}`
  }

  // getDayCount 함수 선언
  const getDayCount = (start: string, end: string) => {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const diffMs = endTime - startTime
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays + 1
  }


  const handleSendToTimeline = () => { // timeline 페이지로 이동하는 함수 정의
    navigate('/timeline')
  }

  useEffect(() => {
    if (!isNewTravel) {
      setName(mockTravel.name)
      setStartDate(mockTravel.startDate ?? '')
      setEndDate(mockTravel.endDate ?? '')
      setTotalBudget(mockTravel.totalBudget)

    }
  }, [isNewTravel])

  return (
    <div className="min-h-screen bg-pure-white">
      <div className="border-b border-pebble px-10 py-6">
        <div className="flex items-center gap-6">
          {isEditingTravelInfo ? (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-pebble px-2 py-1 text-xl font-bold"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-pebble px-2 py-1"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-pebble px-2 py-1"
              />
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="border border-pebble px-2 py-1"
              />
              <button onClick={() => setIsEditingTravelInfo(false)}>완료</button>
            </>
          ) : (
            <>
              <h1 className="text-xl text-deep-ink">{name || '여행 이름'}</h1>
              <span className="text-sm text-cool-ash">
                {startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)} · ${getDayCount(startDate, endDate)}일` : '기간 미정'}
              </span>
              <span className="text-sm text-cool-ash">
                예산 {totalBudget.toLocaleString()}원
              </span>
              <button onClick={() => setIsEditingTravelInfo(true)}>✏️</button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 p-8">
        {/* 지도 영역 - 자리표시자를 실제 KakaoMap으로 교체
          핀 클릭 시 목록 클릭과 동일하게 selectedPlace를 바꿔줌 */}
        <div className="w-96 border border-pebble">
          <KakaoMap places={mockPlaces} onMarkerClick={setSelectedPlace} />
        </div>

        {/* 여행지 목록 - 클릭하면 selectedPlace만 바뀜, 담기 버튼 없음 */}
        <div className="w-64 border border-pebble p-4">
          <h2 className="text-deep-ink font-bold mb-3">
            여행지 목록 <span className="text-cool-ash font-normal">{mockPlaces.length}곳</span>
          </h2>

          {mockPlaces.map((place) => ( // 배열 각 항목을 하나씩 다른 걸로 변환 -> mockPlaces 의 장소 배열 각각을 <PlaceListItem> 으로 변경
            <PlaceListItem
              key={place.id}
              place={place}
              isSelected={selectedPlace?.id === place.id} // 옵셔널 체이닝 - null 일 떄 에러 방지하기 위해서 있으면 id 그냥 읽고, 없으면 undefined 반환해라
              onClick={() => setSelectedPlace(place)} // 클릭 발생 시 코드 실행 예약
            />
          ))}

        </div>

        {/* 여행지 상세 - 담기 버튼이 여기 있음 */}
        <div className="w-72 border border-pebble p-4">
          <h2 className="text-deep-ink font-bold mb-3">상세 정보</h2>
          <PlaceDetail place={selectedPlace} />
        </div>

        {/* 여행가방 + 타임라인으로 보내기 버튼 */}
        <div className="w-64 border border-pebble p-4">
          <BagPanel />
          <button
            onClick={handleSendToTimeline}
            disabled={bagItems.length === 0 || !canProceedToTimeline} // true면 버튼 눌리지 않도록 비활성화 처리함 -> 여행가방에 장소가 없으면 비활성화, 있으면 활성화
            className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 mt-4"
          >
            타임라인으로 보내기
          </button>
        </div>
      </div>
    </div>
  )
}