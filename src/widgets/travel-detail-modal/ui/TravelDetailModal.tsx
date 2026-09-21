// 여행 상세 보여주는 모달 (타임라인 + 지도)

// 여행 상세 보여주는 모달 (타임라인 + 지도) - 읽기 전용, 타임라인 페이지 스타일 재사용

import { useState, useEffect, useRef } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelDetail, UserProfile } from '../../../entities/travel/model/types'
import type { Place } from '../../../entities/place/model/types'
import { Map, CustomOverlayMap, Polyline } from 'react-kakao-maps-sdk'

import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useTravelDraftStore } from '../../../entities/travel/model/useTravelDraftStore'
import { useBagStore } from '../../../entities/bag/model/useBagStore'
import { addVisit, clearVisits } from '../../../entities/travel/model/visitSlice'
import type { DayRoute } from '../../../entities/travel/model/types'

interface TravelDetailModalProps {
    travelId: number | null
    onClose: () => void
    onNavigateToOriginal?: (originalTravelId: number) => void
}

export default function TravelDetailModal({ travelId, onClose, onNavigateToOriginal }: TravelDetailModalProps) {
    const [detail, setDetail] = useState<TravelDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [author, setAuthor] = useState<UserProfile | null>(null)
    const [originalAuthor, setOriginalAuthor] = useState<UserProfile | null>(null)
    const [selectedDay, setSelectedDay] = useState(1)
    const [mapCenter] = useState({ lat: 35.8353, lng: 129.2107 }) // 지도 최초 위치만 담당 (이후 이동은 panTo가 처리)
    const mapRef = useRef<kakao.maps.Map | null>(null) // 지도 인스턴스를 저장해서 panTo를 호출하기 위함
    const [routes, setRoutes] = useState<DayRoute[]>([])

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const setName = useTravelDraftStore((state) => state.setName)
    const setStartDate = useTravelDraftStore((state) => state.setStartDate)
    const setEndDate = useTravelDraftStore((state) => state.setEndDate)
    const setTotalBudget = useTravelDraftStore((state) => state.setTotalBudget)
    const setOriginalId = useTravelDraftStore((state) => state.setOriginalId)
    const clearBag = useBagStore((state) => state.clearBag)
    const addBagItem = useBagStore((state) => state.addItem)

    useEffect(() => {
        if (travelId === null) return

        setDetail(null)
        setAuthor(null)
        setOriginalAuthor(null)
        setRoutes([])
        setError(null)
        setIsLoading(true)
        setSelectedDay(1)

        const fetchDetail = async () => {
            try {
                const response = await api.get(`/travels/${travelId}`)
                setDetail(response.data)

                const authorResponse = await api.get(`/users/${response.data.userId}`)
                setAuthor(authorResponse.data)

                if (response.data.originalId) {
                    const originalTravelResponse = await api.get(`/travels/${response.data.originalId}`)
                    const originalAuthorResponse = await api.get(`/users/${originalTravelResponse.data.userId}`)
                    setOriginalAuthor(originalAuthorResponse.data)
                }

                // 경로/소요시간 조회 추가
                const routesResponse = await api.get(`/travels/${travelId}/routes`)
                setRoutes(routesResponse.data)

            } catch (err) {
                console.error("여행 상세 조회 실패", err)
                setError("여행 정보를 불러오지 못했습니다.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchDetail()
    }, [travelId])

    // 여행에 등장하는 Day 목록 (1, 2, 3 ...)
    const dayNumbers = detail
        ? Array.from(new Set(detail.visits.map((v) => v.day))).sort((a, b) => a - b)
        : []

    // 선택된 Day의 일정만, visitOrder 순으로
    const visitsForSelectedDay = detail
        ? detail.visits
            .filter((v) => v.day === selectedDay)
            .slice()
            .sort((a, b) => a.visitOrder - b.visitOrder)
        : []

    // KakaoMap(전체 bags 표시용)과 지도 경로(선택된 Day용)에 쓸 Place 배열
    const bagPlaces: Place[] = detail
        ? detail.bags.map((bag) => ({
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
        : []

    // 선택된 Day 경로에 쓸 좌표들 (visitOrder 순서)
    const dayRoutePlaces = visitsForSelectedDay
        .map((visit) => bagPlaces.find((p) => p.id === visit.placeId))
        .filter((p): p is Place => p !== undefined)

    // 경로 계산
    const currentDayRoute = routes.find((r) => r.day === selectedDay)

    const getLegAfter = (visitId: number) =>
        currentDayRoute?.legs.find((leg) => leg.fromVisitId === visitId)

    // Day가 바뀌면 그 날의 첫 장소로 부드럽게 이동
    useEffect(() => {
        if (dayRoutePlaces.length > 0 && mapRef.current) {
            const position = new kakao.maps.LatLng(dayRoutePlaces[0].latitude, dayRoutePlaces[0].longitude)
            mapRef.current.panTo(position)
        }
    }, [selectedDay, detail])

    // 경로 목록 클릭 시 그 장소로 부드럽게 이동
    const handleMoveToPlace = (place: Place) => {
        if (!mapRef.current) return
        const position = new kakao.maps.LatLng(place.latitude, place.longitude)
        mapRef.current.panTo(position)
    }

    const handleCopyToMyTravel = () => {
        if (!detail) return

        clearBag()
        dispatch(clearVisits())

        setName(`${detail.name} (복사본)`)
        setStartDate(detail.startDate)
        setEndDate(detail.endDate)
        setTotalBudget(detail.totalBudget)
        setOriginalId(detail.id)

        bagPlaces.forEach((place) => addBagItem(place))

        detail.visits.forEach((visit) => {
            dispatch(addVisit({
                placeId: visit.placeId,
                day: visit.day,
                cost: visit.cost,
                visitOrder: visit.visitOrder,
                startTime: visit.startTime.slice(0, 5),
                endTime: visit.endTime.slice(0, 5),
            }))
        })

        onClose()
        navigate('/travels/new/map')
    }

    const handleLike = async () => {
        if (!detail) return
        try {
            await api.post('/travels/like', { travelId: detail.id })
            onClose()
            navigate('/mypage') // 마이페이지로 이동하는 게 좋을지...?
        } catch (error) {
            console.log('찜하기 실패', error)
        }
    }

    if (travelId === null) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-flat w-full h-full max-w-[1600px] flex flex-col overflow-hidden">
                {/* 상단 바 */}
                <div className="border-b border-pebble px-8 py-5 flex items-center justify-between shrink-0">
                    <div>
                        {detail && (
                            <>
                                <h2 className="text-xl font-bold text-deep-ink">{detail.name}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    {author && (
                                        <p className="text-sm text-cool-ash">작성자: {author.name}</p>
                                    )}
                                    {originalAuthor && detail.originalId && (
                                        <button
                                            onClick={() => onNavigateToOriginal?.(detail.originalId!)}
                                            className="text-sm text-deep-ink underline"
                                        >
                                            원작: {originalAuthor.name}님의 여행 보러가기
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full border border-pebble flex items-center justify-center text-deep-ink shrink-0"
                    >
                        ✕
                    </button>
                </div>

                {isLoading && <p className="p-8 text-cool-ash">불러오는 중...</p>}
                {error && <p className="p-8 text-red-500">{error}</p>}

                {detail && (
                    <>
                        {/* Day 탭 */}
                        <div className="px-8 pt-4 flex gap-2 shrink-0">
                            {dayNumbers.map((day) => (
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

                        {/* 본문: 타임라인 + 지도 */}
                        <div className="flex-1 flex gap-6 px-8 py-6 overflow-hidden">
                            {/* 타임라인 카드 목록 */}
                            <div className="flex-1 overflow-y-auto">
                                {visitsForSelectedDay.length === 0 && (
                                    <p className="text-sm text-cool-ash">이 날짜엔 등록된 일정이 없습니다.</p>
                                )}

                                <div className="flex flex-col gap-4">
                                    {visitsForSelectedDay.map((visit, index) => {
                                        const place = dayRoutePlaces.find((p) => p.id === visit.placeId)
                                        const leg = getLegAfter(visit.id)

                                        return (
                                            <div key={visit.id}>
                                                <div
                                                    onClick={() => place && handleMoveToPlace(place)}
                                                    className="card-elevated-hover p-4 cursor-pointer hover:bg-pebble/10 transition-colors"
                                                >
                                                    <p className="text-sm text-cool-ash mb-1">
                                                        {visit.startTime.slice(0, 5)} - {visit.endTime.slice(0, 5)}
                                                    </p>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-bold text-deep-ink">{visit.name}</h3>
                                                        <span className="text-xs text-cool-ash">
                                                            {visit.cost > 0 ? `${visit.cost.toLocaleString()}원` : '가격 미정'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-cool-ash">{visit.address}</p>
                                                </div>

                                                {index < visitsForSelectedDay.length - 1 && leg?.available && (
                                                    <div className="flex items-center gap-2 py-2 pl-4 text-xs text-cool-ash">
                                                        <span>🚗</span>
                                                        <span>{(leg.distance / 1000).toFixed(1)}km · 약 {Math.round(leg.duration / 60)}분</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 지도 + 경로 요약 */}
                            <div className="flex-1 card-elevated overflow-hidden shrink-0 flex flex-col">
                                <h3 className="text-deep-ink font-bold p-4 pb-2 shrink-0">
                                    {selectedDay}일차 경로
                                </h3>

                                <div className="flex-1">
                                    <Map
                                        center={mapCenter}
                                        style={{ width: '100%', height: '100%' }}
                                        level={3}
                                        onCreate={(map) => {
                                            mapRef.current = map
                                            if (dayRoutePlaces.length > 0) {
                                                const position = new kakao.maps.LatLng(dayRoutePlaces[0].latitude, dayRoutePlaces[0].longitude)
                                                map.panTo(position)
                                            }
                                        }}
                                    >
                                        {dayRoutePlaces.map((place, index) => (
                                            <CustomOverlayMap key={place.id} position={{ lat: place.latitude, lng: place.longitude }}>
                                                <div className="w-6 h-6 rounded-full bg-deep-ink text-white text-xs flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                            </CustomOverlayMap>
                                        ))}

                                        {dayRoutePlaces.length > 1 && (
                                            <Polyline
                                                path={dayRoutePlaces.map((place) => ({ lat: place.latitude, lng: place.longitude }))}
                                                strokeWeight={3}
                                                strokeColor="#000d10"
                                                strokeOpacity={0.7}
                                                strokeStyle="shortdash"
                                            />
                                        )}
                                    </Map>
                                </div>
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        <div className="border-t border-pebble px-8 py-5 shrink-0 flex gap-3">
                            <button
                                type="button"
                                onClick={handleLike}
                                className="rounded-pill border border-pebble text-deep-ink px-6 py-2.5 text-sm font-semibold"
                            >
                                찜하기
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyToMyTravel}
                                className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold"
                            >
                                수정해서 내 여행으로 저장
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )

}