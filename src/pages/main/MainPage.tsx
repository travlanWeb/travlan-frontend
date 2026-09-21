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
import { useTravelDraftStore } from '../../entities/travel/model/useTravelDraftStore'
import { usePlaces } from '../../entities/place/model/usePlaces'
import { CATEGORY_FILTERS } from '../../entities/place/model/categoryMap'
import TravelNavTabs from '../../widgets/travel-nav-tabs/TravelNavTabs'
import { useDispatch } from 'react-redux'
import { api } from '../../shared/api/axiosInstance'
import { clearVisits, addVisit } from '../../entities/travel/model/visitSlice'
import RangeSlider from '../../shared/ui/RangeSlider'


export default function MainPage() {

  const places = usePlaces()

  // 생성 + 입력 게이트 추가
  const { travelId } = useParams()
  const isNewTravel = travelId === 'new' // travel id 가 new 이면 newTravel 확인

  // useTravelDraftStore 생성하여 위 코드 대체함 -> 여러 줄 코드 구조분해할당으로 한 줄로 대체함
  const { name, startDate, endDate, totalBudget, setName, setStartDate, setEndDate, setTotalBudget, setOriginalId } = useTravelDraftStore()
  console.log('MainPage 진입 시 originalId:', useTravelDraftStore.getState().originalId) // 추가

  // const isFormComplete = name && startDate && endDate && totalBudget // isFormCompleted 일 때만 타임라인으로 넘길 수 있도록 해야 함
  const canProceedToTimeline = name && totalBudget // timeline 으로 넘길 수 있는지 판단하는 함수

  // navigate 파트
  const navigate = useNavigate() // navigate 에 페이지 이동 함수 담기
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null) // 컴포넌트가 화면에 그려질 때마다 React 내부에 값 하나 새로 등록/유지
  const bagItems = useBagStore((state) => state.items) // useBagStore 에서 items 만 가져옴, 다른 컴포넌트에서 addItem 호출해서 뭔가 추가되면 Zustand 가 자동 렌더링, bagItems가 자동 갱신됨 (구독 형태)

  // 정보 수정 상태 useEffect
  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false)

  // 장소 검색 기능 추가
  const [searchQuery, setSearchQuery] = useState('')



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

  // 가격 필터 적용
  const MAX_PLACE_PRICE = 100000
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PLACE_PRICE])

  // 필터 기능 추가
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredPlaces = useMemo(() => {
    let result = selectedCategory === '전체'
      ? places
      : places.filter((place) => place.category === selectedCategory)

    if (searchQuery.trim()) {
      result = result.filter((place) =>
        place.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    }


    // 가격 필터 - price가 null(가격 미정)인 장소는 필터와 무관하게 항상 포함
    result = result.filter((place) => {
      if (place.price === null) return true
      return place.price >= priceRange[0] && place.price <= priceRange[1]
    })

    return result
  }, [places, selectedCategory, searchQuery, priceRange])

  const placesForMap = useMemo(() => {
    const bagPlaceIds = new Set(bagItems.map((item) => item.id))
    const missingBagItems = bagItems.filter((item) => !filteredPlaces.some((p) => p.id === item.id))
    return [...filteredPlaces, ...missingBagItems]
  }, [filteredPlaces, bagItems])


  const dispatch = useDispatch()
  const clearBag = useBagStore((state) => state.clearBag)
  const addBagItem = useBagStore((state) => state.addItem)


  // 예산 입력창 관련

  const handleBudgetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '') // 숫자 아닌 문자 다 제거 (콤마 포함)
    const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10) // 앞의 0들은 parseInt가 자동으로 무시함
    setTotalBudget(numericValue)
  }

  const handleAddBudget = (amount: number) => {
    setTotalBudget(totalBudget + amount)
  }


  // 여행 수정 관련

  useEffect(() => {
    if (isNewTravel) {
      // 이전 편집 내용 남아있을 경우 저장 관련 경고 메시지 추가
      const hasUnsavedDraft = name || startDate || endDate || totalBudget > 0 || bagItems.length > 0

      if (hasUnsavedDraft) {
        const confirmLeave = confirm('저장하지 않은 변경사항이 있습니다. 계속하면 변경사항이 사라집니다. 계속하시겠습니까?')
        if (!confirmLeave) {
          // 취소 시 이전 화면으로 돌아가기
          navigate(-1)
          return
        }
      }

      // 신규 여행 시작 시 남아있는 데이터 초기화
      setName('')
      setStartDate('')
      setEndDate('')
      setTotalBudget(0)
      setOriginalId(null)
      clearBag()
      dispatch(clearVisits())
      return
    }


    const fetchTravelForEdit = async () => {
      try {
        const response = await api.get(`/travels/${travelId}`)
        const travel = response.data
        console.log('불러온 travel.bags:', travel.bags) // 추가

        setName(travel.name)
        setStartDate(travel.startDate ?? '')
        setEndDate(travel.endDate ?? '')
        setTotalBudget(travel.totalBudget)

        // 여행가방 채우기
        clearBag()
        const bagPlaces: Place[] = travel.bags.map((bag: any) => ({
          id: bag.placeId,
          apiId: '',
          name: bag.placeName,
          category: '',
          address: bag.address,
          price: null,
          latitude: bag.latitude,
          longitude: bag.longitude,
          imgUrl: '',
          tel: '',
          overview: '',
        }))
        bagPlaces.forEach((place) => addBagItem(place))

        // 일정 채우기
        dispatch(clearVisits())
        travel.visits.forEach((visit: any) => {
          dispatch(addVisit({
            placeId: visit.placeId,
            day: visit.day,
            cost: visit.cost,
            visitOrder: visit.visitOrder,
            startTime: visit.startTime.slice(0, 5),
            endTime: visit.endTime.slice(0, 5),
          }))
        })
      } catch (error) {
        console.error('여행 정보 조회 실패', error)
      }
    }

    fetchTravelForEdit()
  }, [isNewTravel, travelId])



  // 지도 위에 있는 핀만 리스트로 전달하는 기능 (KakaoMap 에서 onBounds~ 로 가져옴)
  const [mapBounds, setMapBounds] = useState<kakao.maps.LatLngBounds | null>(null)

  // 카테고리 걸러진 것 중에서 지도 범위 안에 있는 장소들만 걸러내기
  const visiblePlaces = mapBounds
    ? filteredPlaces.filter((place) => {
      const position = new kakao.maps.LatLng(place.latitude, place.longitude)
      return mapBounds.contain(position)
    })
    : filteredPlaces

  const [isBagOpen, setIsBagOpen] = useState(false)

  // "상세보기" 버튼 전용 모달 상태 - selectedPlace(지도 포커스/카드 선택)와 분리
  const [detailPlace, setDetailPlace] = useState<Place | null>(null)

  // 카드에 마우스 올렸을 때 지도 마커를 강조하기 위한 상태
  const [hoveredPlaceId, setHoveredPlaceId] = useState<number | null>(null)



  return (
    <div className="min-h-screen bg-pure-white">
      <div className="max-w-[1600px] mx-auto px-10">

        <div className="border-b border-pebble py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-wrap">

              {isEditingTravelInfo ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-pebble rounded-input px-2 py-1 text-xl font-bold outline-none focus:border-deep-ink focus:ring-0 w-40"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-pebble rounded-input px-2 py-1 outline-none focus:border-deep-ink focus:ring-0 w-36"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-pebble rounded-input px-2 py-1 outline-none focus:border-deep-ink focus:ring-0 w-36"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={totalBudget.toLocaleString()}
                      onChange={handleBudgetInput}
                      className="border border-pebble rounded-input px-2 py-1 w-32 text-right outline-none focus:border-deep-ink focus:ring-0"
                    />
                    <span className="text-sm text-cool-ash">원</span>
                  </div>

                  <div className="flex gap-1">
                    <button onClick={() => handleAddBudget(50000)} className="text-xs border border-pebble rounded-pill px-2 py-1">+5만</button>
                    <button onClick={() => handleAddBudget(100000)} className="text-xs border border-pebble rounded-pill px-2 py-1">+10만</button>
                    <button onClick={() => handleAddBudget(500000)} className="text-xs border border-pebble rounded-pill px-2 py-1">+50만</button>
                    <button onClick={() => handleAddBudget(1000000)} className="text-xs border border-pebble rounded-pill px-2 py-1">+100만</button>
                  </div>
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
            <TravelNavTabs disableTimeline={!canProceedToTimeline} />
          </div>

          {/* 검색창 + 가격 슬라이더 + 카테고리 필터를 하나의 카드로 묶음 */}
          <div className="bg-pure-white border border-pebble rounded-flat p-4 mt-6 mb-4 flex items-center gap-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소 이름으로 검색"
              className="border border-pebble rounded-input px-4 py-2 text-sm w-56 outline-none focus:border-deep-ink focus:ring-0 shrink-0"
            />

            <div className="w-64 shrink-0">
              <RangeSlider
                min={0}
                max={MAX_PLACE_PRICE}
                step={5000}
                value={priceRange}
                onChange={setPriceRange}
                formatLabel={(v) => `${v.toLocaleString()}원`}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
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
          </div>
        </div>

        {/* 에어비앤비 스타일 - 지도(왼쪽, 고정폭) + 카드 그리드(오른쪽, 넓게) */}
        <div className="flex gap-6 pb-8 h-[750px]">
          {/* 1단: 지도 - 카드 그리드보다 넓은 비율(약 55%) */}
          <div className="flex-[1.2] bg-pure-white rounded-flat overflow-hidden h-full">
            <KakaoMap
              places={placesForMap}
              onMarkerClick={setSelectedPlace}
              onBoundsChange={setMapBounds}
              moveToPlace={selectedPlace}
              selectedPlaceId={selectedPlace?.id ?? null}
              hoveredPlaceId={hoveredPlaceId}
            />
          </div>

          {/* 2단: 카드 그리드 - 남는 폭 전부 사용 */}
          <div className="flex-1 bg-pure-white rounded-flat p-4 h-full overflow-y-auto scrollbar-thin">
            <h2 className="text-deep-ink font-bold mb-3">
              여행지 목록 <span className="text-cool-ash font-normal">{visiblePlaces.length}곳</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {visiblePlaces.map((place) => (
                <PlaceListItem
                  key={place.id}
                  place={place}
                  isSelected={selectedPlace?.id === place.id}
                  onClick={() => setSelectedPlace(place)}
                  onDetailClick={() => setDetailPlace(place)}
                  onHover={() => setHoveredPlaceId(place.id)}
                  onHoverEnd={() => setHoveredPlaceId(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 여행가방 플로팅 탭 - 화면 오른쪽에 항상 걸쳐있음 */}
      <button
        onClick={() => setIsBagOpen(!isBagOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-deep-ink text-pure-white rounded-l-flat px-3 py-6 flex flex-col items-center gap-2 shadow-md"
      >
        <span className="text-sm font-semibold [writing-mode:vertical-rl]">여행가방</span>
        <span className="text-xs bg-clay-ember text-deep-ink rounded-pill w-5 h-5 flex items-center justify-center">
          {bagItems.length}
        </span>
      </button>

      {/* 여행가방 슬라이드 패널 */}
      <div
        className={`fixed top-[68px] right-0 h-[calc(100%-68px)] w-96 bg-pure-white border-l border-pebble z-50 flex flex-col p-4 transition-transform duration-300 ${isBagOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-deep-ink font-bold">여행가방</h2>
          <button onClick={() => setIsBagOpen(false)} className="text-cool-ash">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <BagPanel />
        </div>

        <button
          onClick={handleSendToTimeline}
          disabled={bagItems.length === 0 || !canProceedToTimeline}
          className="rounded-pill bg-clay-ember text-deep-ink px-6 py-2.5 text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 mt-4"
        >
          타임라인으로 보내기
        </button>
      </div>

      {/* 패널 열렸을 때 배경 어둡게, 클릭하면 닫힘 */}
      {isBagOpen && (
        <div
          onClick={() => setIsBagOpen(false)}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}

      {/* 장소 상세 모달 - "상세보기" 버튼 전용, 카드 선택(selectedPlace)과는 분리된 상태 */}
      {detailPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-pure-white border border-pebble rounded-flat w-full max-w-md max-h-[85vh] p-6 overflow-hidden flex flex-col">
            <PlaceDetail place={detailPlace} onClose={() => setDetailPlace(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
