// 백엔드 연동 전 목업 데이터 넣어둠
// visits 가져오기 추가(9/16)

import { useState, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addVisit, updateVisit, removeVisit } from "../../../entities/travel/model/visitSlice"
import type { RootState } from "../../../app/store"
import { useBagStore } from "../../../entities/bag/model/useBagStore"
import { getUserIdFromToken } from "../../../entities/auth/model/getUserId"
import { api } from "../../../shared/api/axiosInstance"
import { useTravelDraftStore } from "../../../entities/travel/model/useTravelDraftStore"
import { useNavigate } from "react-router-dom"
import { Map, CustomOverlayMap, Polyline } from "react-kakao-maps-sdk"
import { TRAVEL_STATUS } from "../../../entities/travel/model/travelStatus"
import TravelNavTabs from "../../../widgets/travel-nav-tabs/TravelNavTabs"
import { addMinutesToTime, generateTimeOptions } from "../../../shared/lib/timeOptions"
import { CATEGORY_DURATION_MINUTES } from "../../../entities/place/model/categoryMap"
import { CATEGORY_FILTERS } from "../../../entities/place/model/categoryMap"
import { useParams } from "react-router-dom"
import { uploadImage } from "../../../shared/api/uploadImage"


export default function TimelinePage() {
    const { travelId } = useParams()
    const [mapCenter] = useState({ lat: 35.8353, lng: 129.2107 }) // 최초 위치만
    const mapRef = useRef<kakao.maps.Map | null>(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const bagItems = useBagStore((state) => state.items)
    const visits = useSelector((state: RootState) => state.visit.items)
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)
    const { name, startDate, endDate, totalBudget, originalId, travelImage, setTravelImage } = useTravelDraftStore()
    const [draggedVisitId, setDraggedVisitId] = useState<number | null>(null)
    const [selectedBagCategory, setSelectedBagCategory] = useState('전체')

    // 여행 사진 업로드
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const url = await uploadImage(file)
            setTravelImage(url)
        } catch (error) {
            console.error('여행 사진 업로드 실패', error)
        }
    }

    // 기본값 계산 함수
    const getDefaultTravelImage = () => {
        const day1Visits = visits.filter((v) => v.day === 1).sort((a, b) => a.visitOrder - b.visitOrder)
        if (day1Visits.length > 0) {
            const firstPlace = bagItems.find((item) => item.id === day1Visits[0].placeId)
            if (firstPlace?.imgUrl) return firstPlace.imgUrl
        }
        return null // 없으면 null - 화면에서 플레이스홀더로 처리
    }

    const previewImage = travelImage || getDefaultTravelImage()

    // 지금 보고 있는 Day (탭)
    const [selectedDay, setSelectedDay] = useState(1)

    // startDate ~ endDate 사이 일수만큼 Day 탭 생성 (예: 3일이면 [1,2,3])
    const getDayCount = (start: string, end: string) => {
        if (!start || !end) return 1
        const diffMs = new Date(end).getTime() - new Date(start).getTime()
        return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1)
    }
    const dayCount = getDayCount(startDate, endDate)
    const dayTabs = Array.from({ length: dayCount }, (_, i) => i + 1)

    const bags = bagItems.map((place) => ({ placeId: place.id }))

    // 지금 선택된 Day에 해당하는 visits만 순서대로
    const visitsForSelectedDay = visits
        .filter((v) => v.day === selectedDay)
        .slice()
        .sort((a, b) => a.visitOrder - b.visitOrder)

    // 오늘(선택된 day)에 담겨있는지
    const isAddedToday = (placeId: number) =>
        visits.some((v) => v.placeId === placeId && v.day === selectedDay)

    // 오늘이 아닌 다른 날에 담겨있는지
    const isAddedOnOtherDay = (placeId: number) =>
        visits.some((v) => v.placeId === placeId && v.day !== selectedDay)

    // 일정에 추가 / 빼기 토글
    const toggleAddToSchedule = (placeId: number) => {
        const place = bagItems.find((item) => item.id === placeId)
        if (!place) return

        if (isAddedToday(placeId)) {
            dispatch(removeVisit({ placeId, day: selectedDay })) // day도 같이 전달
        } else {
            dispatch(addVisit({
                placeId: place.id,
                day: selectedDay,
                cost: place.price ?? 0,
                visitOrder: visitsForSelectedDay.length + 1,
                startTime: '',
                endTime: '',
            }))
            handleMoveToPlace(place)
        }
    }

    // 총 사용 금액 (모든 day의 visits cost 합산)
    const usedAmount = visits.reduce((sum, v) => sum + (v.cost || 0), 0)
    const remainingAmount = totalBudget - usedAmount
    const usedPercent = totalBudget > 0 ? Math.min(100, (usedAmount / totalBudget) * 100) : 0
    const timeOptions = generateTimeOptions()

    const handleMoveToPlace = (place: typeof bagItems[number]) => {
        if (!mapRef.current) return
        const position = new kakao.maps.LatLng(place.latitude, place.longitude)
        mapRef.current.panTo(position)
    }

    // 저장 함수 - endpoint가 아니라 status(DRAFT/COMPLETED)를 받아서 /travels 하나로 통일
    const handleSave = async (status: string) => {
        if (!accessToken) return
        const userId = getUserIdFromToken(accessToken)

        const formattedVisits = visits.map((visit) => ({
            ...visit,
            startTime: visit.startTime ? visit.startTime + ':00' : '00:00:00',
            endTime: visit.endTime ? visit.endTime + ':00' : '00:00:00',
        }))

        try {
            if (travelId && travelId !== 'new') {
                // 기존 여행 수정 - PUT, userId/originalId 없음
                const payload = { name, totalBudget, status, startDate, endDate, bags, visits: formattedVisits }
                const response = await api.put(`/travels/${travelId}`, payload)
                console.log("수정 성공", response.data)
            } else {
                // 신규 생성 - POST, userId/originalId 포함
                const payload = { userId, name, totalBudget, status, startDate, endDate, bags, visits: formattedVisits, originalId }
                const response = await api.post('/travels', payload)
                console.log("저장 성공", response.data)
            }
            navigate('/mypage')
        } catch (error) {
            console.error("저장 실패", error)
        }
    }

    // 지도에 찍을 좌표들 - 선택된 Day의 visitOrder 순서대로
    const timelinePlaces = visitsForSelectedDay
        .map((visit) => bagItems.find((item) => item.id === visit.placeId))
        .filter((place): place is typeof bagItems[number] => place !== undefined)

    useEffect(() => {
        if (timelinePlaces.length > 0 && mapRef.current) {
            const position = new kakao.maps.LatLng(timelinePlaces[0].latitude, timelinePlaces[0].longitude)
            mapRef.current.panTo(position)
        }
    }, [selectedDay])


    // 예산 바 조건부 색상 변경을 위해 변수 선언
    const isOverBudget = usedAmount > totalBudget


    // 순서 바꾸는 함수 추가
    const handleReorder = (targetPlaceId: number) => {
        if (draggedVisitId === null || draggedVisitId === targetPlaceId) return

        const draggedVisit = visitsForSelectedDay.find((v) => v.placeId === draggedVisitId)
        const targetVisit = visitsForSelectedDay.find((v) => v.placeId === targetPlaceId)
        if (!draggedVisit || !targetVisit) return

        // 두 항목의 visitOrder를 서로 교환
        dispatch(updateVisit({ placeId: draggedVisit.placeId, field: 'visitOrder', value: targetVisit.visitOrder }))
        dispatch(updateVisit({ placeId: targetVisit.placeId, field: 'visitOrder', value: draggedVisit.visitOrder }))

        setDraggedVisitId(null)
    }

    // 타임라인 페이지의 여행가방에서도 카테고리 별로 구분하여 볼 수 있도록 구현

    // 필터링된 여행가방 목록
    const filteredBagItems = selectedBagCategory === '전체'
        ? bagItems
        : bagItems.filter((place) => place.category === selectedBagCategory)



    return (
        <div className="max-w-[1400px] mx-auto px-10 py-8">
            {/* 여행 정보 + 예산 바 */}
            <div className="border-b border-pebble pb-6 mb-6">


                <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-flat bg-pebble/20 overflow-hidden flex items-center justify-center text-xs text-cool-ash shrink-0">
                        {previewImage ? (
                            <img src={previewImage} alt="대표 사진" className="w-full h-full object-cover" />
                        ) : (
                            '사진'
                        )}
                    </div>
                    <label className="rounded-pill border border-pebble text-deep-ink px-4 py-1.5 text-xs font-semibold cursor-pointer">
                        대표 사진 변경
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {!travelImage && previewImage && (
                        <span className="text-xs text-cool-ash">1일차 첫 장소 사진이 기본으로 사용됩니다</span>
                    )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-deep-ink">{name || '여행 이름'}</h1>
                    <TravelNavTabs />
                </div>

                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span className="text-sm text-cool-ash mr-2">사용 금액</span>
                        <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-deep-ink'}`}>
                            {usedAmount.toLocaleString()}원
                        </span>
                    </div>
                    <div className="text-md text-cool-ash">
                        총 예산 {totalBudget.toLocaleString()}원 · 잔액 {remainingAmount.toLocaleString()}원
                    </div>
                </div>

                {/* 예산 진행 바 */}
                <div className="w-full h-2 bg-pebble/40 rounded-pill overflow-hidden">
                    <div
                        className={`h-full ${isOverBudget ? 'bg-red-600' : 'bg-deep-ink'}`}
                        style={{ width: `${usedPercent}%` }}
                    />
                </div>
            </div>

            <div className="flex gap-6 h-[650px]">
                {/* 좌측: 여행가방 */}
                <div className="w-72 border border-pebble rounded-flat p-4 overflow-y-auto shrink-0">
                    <h2 className="text-deep-ink font-bold mb-1">여행가방 <span className="text-cool-ash font-normal">{bagItems.length}곳</span></h2>
                    <p className="text-xs text-cool-ash mb-4">아래 장소를 선택해 오늘 일정에 추가하세요.</p>

                    {/* 카테고리 필터 추가하기 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {CATEGORY_FILTERS.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedBagCategory(category)}
                                className={`px-3 py-1 text-xs rounded-pill border cursor-pointer ${selectedBagCategory === category
                                    ? 'bg-deep-ink text-pure-white border-deep-ink'
                                    : 'border-pebble text-cool-ash'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {filteredBagItems.map((place) => {
                        const added = isAddedToday(place.id)
                        const addedElsewhere = isAddedOnOtherDay(place.id)
                        return (
                            <div key={place.id} className="border-b border-pebble py-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-deep-ink text-sm">{place.name}</p>
                                    <span className="text-xs text-cool-ash whitespace-nowrap ml-2">
                                        {place.price ? `${place.price.toLocaleString()}원` : '가격 미정'}
                                    </span>
                                </div>
                                <p className="text-xs text-cool-ash mb-2">{place.category}</p>
                                <button
                                    onClick={() => toggleAddToSchedule(place.id)}
                                    className={`w-full rounded-pill py-1.5 text-xs font-semibold transition-colors cursor-pointer ${added
                                        ? 'bg-deep-ink text-pure-white'
                                        : addedElsewhere
                                            ? 'border border-pebble text-cool-ash bg-pebble/45' // 다른 날 담김 - 회색
                                            : 'border border-pebble text-deep-ink' // 기본
                                        }`}
                                >
                                    {added ? '일정에서 빼기' : '+ 일정에 추가'}
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* 중앙: Day 탭 + 타임라인 */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex gap-2 mb-4">
                        {dayTabs.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-5 py-2 text-sm font-semibold rounded-pill border ${selectedDay === day
                                    ? 'bg-deep-ink text-pure-white border-deep-ink'
                                    : 'border-pebble text-cool-ash'
                                    }`}
                            >
                                Day {day}
                            </button>
                        ))}
                    </div>

                    {visitsForSelectedDay.length === 0 && (
                        <p className="text-sm text-cool-ash">왼쪽 여행가방에서 장소를 추가하면 이곳에 일정이 표시됩니다.</p>
                    )}

                    <div className="flex">
                        {/* 세로선 + 번호 */}
                        <div className="flex flex-col items-center mr-4">
                            {visitsForSelectedDay.map((visit, index) => (
                                <div key={visit.placeId} className="flex flex-col items-center">
                                    <div className="w-7 h-7 rounded-full bg-deep-ink text-pure-white text-xs flex items-center justify-center shrink-0">
                                        {index + 1}
                                    </div>
                                    {index < visitsForSelectedDay.length - 1 && (
                                        <div className="w-px flex-1 bg-pebble my-1" style={{ minHeight: '80px' }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 일정 카드들 */}
                        <div className="flex-1 flex flex-col gap-4">
                            {visitsForSelectedDay.map((visit) => {
                                const place = bagItems.find((item) => item.id === visit.placeId)
                                if (!place) return null

                                return (
                                    <div
                                        key={visit.placeId}
                                        draggable
                                        onDragStart={(e) => {
                                            setDraggedVisitId(visit.placeId)
                                            e.dataTransfer.effectAllowed = 'move' // 추가 - "이동" 동작임을 명시
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault()
                                            e.dataTransfer.dropEffect = 'move' // 추가 - 드롭 시에도 "이동" 커서로
                                        }}
                                        onDrop={() => handleReorder(visit.placeId)}
                                        className="border border-pebble rounded-flat p-4 relative"
                                    >
                                        {/* 드래그 핸들 - 오른쪽 상단 */}
                                        <div className="absolute top-4 right-4 grid grid-cols-2 gap-1 cursor-grab">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-pebble" />
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 mb-2 pr-6">
                                            <select
                                                value={visit.startTime}
                                                onChange={(e) => {
                                                    const newStartTime = e.target.value
                                                    dispatch(updateVisit({ placeId: place.id, field: 'startTime', value: newStartTime }))

                                                    const duration = CATEGORY_DURATION_MINUTES[place.category]
                                                    if (duration !== null && duration !== undefined) {
                                                        const newEndTime = addMinutesToTime(newStartTime, duration)
                                                        dispatch(updateVisit({ placeId: place.id, field: 'endTime', value: newEndTime }))
                                                    }
                                                }}
                                                className="border border-pebble px-2 py-1 text-sm text-cool-ash"
                                            >
                                                <option value="">시작 시간</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                            <span className="text-sm text-cool-ash">~</span>
                                            <select
                                                value={visit.endTime}
                                                onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'endTime', value: e.target.value }))}
                                                className="border border-pebble px-2 py-1 text-sm text-cool-ash"
                                            >
                                                <option value="">종료 시간</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between mb-1 pr-6">
                                            <h3 className="font-bold text-deep-ink">{place.name}</h3>
                                            <span className="text-xs text-cool-ash">
                                                {place.price ? `${place.price.toLocaleString()}원` : '가격 미정'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-cool-ash mb-3">{place.address}</p>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-cool-ash">비용</span>
                                            <input
                                                type="number"
                                                value={visit.cost}
                                                onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'cost', value: Number(e.target.value) }))}
                                                className="border border-pebble px-2 py-1 text-xs w-24"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 우측: 오늘의 경로 (지도 + 요약 리스트) */}
                <div className="w-80 border border-pebble rounded-flat overflow-hidden shrink-0 flex flex-col">
                    <h2 className="text-deep-ink font-bold p-4 pb-2">오늘의 경로</h2>

                    <div className="h-64 shrink-0">
                        <Map center={mapCenter}
                            style={{ width: '100%', height: '100%' }}
                            level={9}
                            onCreate={(map) => {
                                mapRef.current = map
                                if (timelinePlaces.length > 0) {
                                    const position = new kakao.maps.LatLng(timelinePlaces[0].latitude, timelinePlaces[0].longitude)
                                    map.panTo(position)
                                }
                            }}>
                            {timelinePlaces.map((place, index) => (
                                <CustomOverlayMap key={place.id} position={{ lat: place.latitude, lng: place.longitude }}>
                                    <div className="w-6 h-6 rounded-full bg-deep-ink text-white text-xs flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                </CustomOverlayMap>
                            ))}

                            {timelinePlaces.length > 1 && (
                                <Polyline
                                    path={timelinePlaces.map((place) => ({ lat: place.latitude, lng: place.longitude }))}
                                    strokeWeight={3}
                                    strokeColor="#000d10"
                                    strokeOpacity={0.7}
                                    strokeStyle="shortdash"
                                />
                            )}
                        </Map>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {visitsForSelectedDay.map((visit, index) => {
                            const place = bagItems.find((item) => item.id === visit.placeId)
                            if (!place) return null
                            return (
                                <div
                                    key={visit.placeId}
                                    onClick={() => handleMoveToPlace(place)}
                                    className="flex items-center justify-between py-2 border-b border-pebble cursor-pointer hover:bg-pebble/10"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-deep-ink text-pure-white text-xs flex items-center justify-center shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm text-deep-ink">{place.name}</span>
                                    </div>
                                    <span className="text-xs text-cool-ash">{visit.startTime || '--:--'}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={() => handleSave(TRAVEL_STATUS.DRAFT)}
                    className="rounded-pill border border-pebble text-deep-ink px-6 py-2.5 text-sm font-semibold"
                >
                    임시저장
                </button>
                <button
                    onClick={() => handleSave(TRAVEL_STATUS.COMPLETED)}
                    className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold"
                >
                    여행 저장하기
                </button>
            </div>
        </div>
    )
}