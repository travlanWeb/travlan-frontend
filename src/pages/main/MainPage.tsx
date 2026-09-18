// useState: 컴포넌트 안에서 바뀌는 값을 다루는 React의 가장 기본적인 훅
// 여기서는 "지금 선택된 여행지가 무엇인지"를 이 페이지 안에서만 기억하면 되므로
// (다른 페이지/컴포넌트가 공유할 필요 없음) Zustand가 아니라 useState로 충분함

import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Place } from '../../entities/place/model/types'
import PlaceListItem from '../../entities/place/ui/PlaceListItem'
import PlaceDetail from '../../entities/place/ui/PlaceDetail'
import BagPanel from '../../widgets/bag-panel/BagPanel'
import { useBagStore } from '../../entities/bag/model/useBagStore'
import KakaoMap from '../../widgets/kakao-map/ui/KakaoMap'
import { useEffect } from 'react'
import { mockTravel } from '../../entities/travel/model/mockTravel'
import { useTravelDraftStore } from '../../entities/travel/model/useTravelDraftStore'
import { usePlaces } from '../../entities/place/model/usePlaces'
import { CATEGORY_FILTERS } from '../../entities/place/model/categoryMap'
import TravelNavTabs from '../../widgets/travel-nav-tabs/TravelNavTabs'


export default function MainPage() {

  const places = usePlaces()

  // 생성 + 입력 게이트 추가
  const { travelId } = useParams()
  const isNewTravel = travelId === 'new' // travel id 가 new 이면 newTravel 확인

  // const [name, setName] = useState('')
  // const [startDate, setStartDate] = useState('')
  // const [endDate, setEndDate] = useState('')
  // const [totalBudget, setTotalBudget] = useState(0)

  // useTravelDraftStore 생성하여 위 코드 대체함 -> 여러 줄 코드 구조분해할당으로 한 줄로 대체함
  const { name, startDate, endDate, totalBudget, setName, setStartDate, setEndDate, setTotalBudget } = useTravelDraftStore()
  console.log('MainPage 진입 시 originalId:', useTravelDraftStore.getState().originalId) // 추가

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


  const handleSendToTimeline = () => { // timeline 으로 이동하는 함수 정의
    navigate(`/timeline/${travelId}`)
  }




  // 필터 기능 추가
  const [selectedCategory, setSelectedCategory] = useState('전체')

  // const filteredPlaces = selectedCategory === '전체'
  //   ? places
  //   : places.filter((place) => place.category === selectedCategory)

  const filteredPlaces = useMemo(() => {
    return selectedCategory === '전체'
      ? places
      : places.filter((place) => place.category === selectedCategory)
  }, [places, selectedCategory])





  useEffect(() => {
    if (!isNewTravel) {
      setName(mockTravel.name)
      setStartDate(mockTravel.startDate ?? '')
      setEndDate(mockTravel.endDate ?? '')
      setTotalBudget(mockTravel.totalBudget)

    }
  }, [isNewTravel])



  // 지도 위에 있는 핀만 리스트로 전달하는 기능 (KakaoMap 에서 onBounds~ 로 가져옴)
  const [mapBounds, setMapBounds] = useState<kakao.maps.LatLngBounds | null>(null)

  // 카테고리 걸러진 것 중에서 지도 범위 안에 있는 장소들만 걸러내기
  const visiblePlaces = mapBounds
    ? filteredPlaces.filter((place) => {
      const position = new kakao.maps.LatLng(place.latitude, place.longitude)
      return mapBounds.contain(position)
    })
    : filteredPlaces



  return (
    <div className="min-h-screen bg-pure-white">
      <div className="max-w-[1200px] mx-auto px-10">

        <div className="border-b border-pebble py-6">
          <div className="flex items-center justify-between">
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
            <TravelNavTabs disableTimeline={!canProceedToTimeline}/>
          </div>
        </div>



        {/* 카테고리 필터 영역 */}
        <div className="flex gap-2 mt-6 mb-4">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 text-sm rounded-pill border ${selectedCategory === category
                ? 'bg-deep-ink text-pure-white border-deep-ink'
                : 'border-pebble text-cool-ash'
                }`}
            >
              {category}
            </button>
          ))}
        </div>


        <div className="flex gap-6 pb-8 h-[600px]">
          {/* 1단: 지도 - 폭을 더 넓게 */}
          <div className="flex-1 border border-pebble h-full">
            <KakaoMap places={filteredPlaces} onMarkerClick={setSelectedPlace} onBoundsChange={setMapBounds} moveToPlace={selectedPlace} selectedPlaceId={selectedPlace?.id ?? null}/>
          </div>

          {/* 2단: 목록 */}
          <div className="w-64 border border-pebble p-4 h-full overflow-y-auto">
            <h2 className="text-deep-ink font-bold mb-3">
              여행지 목록 <span className="text-cool-ash font-normal">{visiblePlaces.length}곳</span>
            </h2>

            {visiblePlaces.map((place) => ( // 배열 각 항목을 하나씩 다른 걸로 변환 -> mockPlaces 의 장소 배열 각각을 <PlaceListItem> 으로 변경
              <PlaceListItem
                key={place.id}
                place={place}
                isSelected={selectedPlace?.id === place.id} // 옵셔널 체이닝 - null 일 떄 에러 방지하기 위해서 있으면 id 그냥 읽고, 없으면 undefined 반환해라
                onClick={() => setSelectedPlace(place)} // 클릭 발생 시 코드 실행 예약
              />
            ))}

          </div>


          {/* 3단: 상세정보 + 여행가방을 세로로 묶은 하나의 컬럼 */}
          <div className="w-72 flex flex-col gap-6 h-full">
            {selectedPlace && (
              <div className="border border-pebble p-4 flex-1 overflow-y-auto">
                <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlace(null)} />
              </div>
            )}

            <div
              className={`border border-pebble p-4 overflow-y-auto ${selectedPlace ? 'max-h-[200px]' : 'flex-1'
                }`}
            >
              <BagPanel />
              <button
                onClick={handleSendToTimeline}
                disabled={bagItems.length === 0 || !canProceedToTimeline}
                className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 mt-4"
              >
                타임라인으로 보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}