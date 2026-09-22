// 여행 상세 보여주는 모달 (타임라인 + 지도)

// 여행 상세 보여주는 모달 (타임라인 + 지도) - 읽기 전용, 타임라인 페이지 스타일 재사용

import { useState, useEffect, useRef } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelDetail, UserProfile } from '../../../entities/travel/model/types'
import type { Place } from '../../../entities/place/model/types'
import { Map, CustomOverlayMap, Polyline, useKakaoLoader } from 'react-kakao-maps-sdk'
import { Car } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { getUserIdFromToken } from '../../../entities/auth/model/getUserId'
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

    const isLikingRef = useRef(false) // 찜하기 중복 클릭 방지용 - state 대신 ref를 쓰는 이유는
    // setState는 리렌더를 기다려야 반영되는데, 그 사이 빠르게 여러 번 누르면 막히지 않기 때문‰

    const mapRef = useRef<kakao.maps.Map | null>(null) // 지도 인스턴스를 저장해서 panTo를 호출하기 위함
    const [kakaoLoading, kakaoError] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    })
    const [routes, setRoutes] = useState<DayRoute[]>([])

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)

    const setName = useTravelDraftStore((state) => state.setName)
    const setStartDate = useTravelDraftStore((state) => state.setStartDate)
    const setEndDate = useTravelDraftStore((state) => state.setEndDate)
    const setTotalBudget = useTravelDraftStore((state) => state.setTotalBudget)
    const setOriginalId = useTravelDraftStore((state) => state.setOriginalId)
    const setJustCopied = useTravelDraftStore((state) => state.setJustCopied)
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
                const routesResponse = await api.get(`/travels/${travelId}/routes`, {timeout: 15000})
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

    // 이 여행이 지금 로그인한 내 소유인지 확인
    // (주의: "찜한 여행"도 백엔드 상 내 계정으로 복사되어 저장되므로 userId만으로는 구분 안 됨)
    const currentUserId = accessToken ? getUserIdFromToken(accessToken) : null
    const isMine = detail !== null && currentUserId === detail.userId
    // 찜만 하고 아직 리믹스(수정)는 안 한 상태 - 아직은 "타인의 여행"처럼 다뤄서
    // 찜하기/복사해서 수정하기 버튼을 그대로 노출함
    const isUnedittedLikedCopy = detail !== null && detail.originalId !== null && !detail.edited
    // 내가 만든 여행이거나, 이미 리믹스해서 수정까지 완료한 내 여행이면
    // 찜하기/복사해서 수정하기 버튼이 필요 없음 (수정은 마이페이지의 "수정" 버튼으로 함)
    const showActionButtons = !isMine || isUnedittedLikedCopy

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

        // 방금 복사해서 채워 넣은 직후라는 표시 - MainPage가 이 데이터를
        // "쓰다 만 임시 데이터"로 착각해서 지우지 않도록 함
        setJustCopied(true)

        onClose()
        navigate('/travels/new/map')
    }

    const handleLike = async () => {
        if (!detail || isLikingRef.current) return
        isLikingRef.current = true
        try {
            await api.post('/travels/like', { travelId: detail.id })
            onClose()
            navigate('/mypage') // 마이페이지로 이동하는 게 좋을지...?
        } catch (error) {
            console.log('찜하기 실패', error)
        } finally {
            isLikingRef.current = false
        }
    }

    if (travelId === null) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-pure-white border border-pebble rounded-flat w-full h-full max-w-[1600px] flex flex-col overflow-hidden">
                {/* 상단 바 - 여백을 넉넉하게 줌 */}
                <div className="border-b border-pebble px-10 py-7 flex items-center justify-between shrink-0">
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
                                            className="text-sm text-clay-ember hover:underline"
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

                                <div className="flex flex-col">
                                    {visitsForSelectedDay.map((visit, index) => {
                                        const place = dayRoutePlaces.find((p) => p.id === visit.placeId)
                                        const leg = getLegAfter(visit.id)
                                        const isLast = index === visitsForSelectedDay.length - 1
                                        // 다음 카드로 이어지는 이동 정보가 있을 때만 커넥터를 그림 - gap 대신 이 영역이 카드 사이 여백을 담당함
                                        const showConnector = !isLast && leg?.available

                                        return (
                                            <div key={visit.id}>
                                                <div
                                                    onClick={() => place && handleMoveToPlace(place)}
                                                    className="border border-pebble rounded-[20px] p-4 cursor-pointer hover:border-mist transition-colors duration-150"
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

                                                {showConnector ? (
                                                    // 카드 왼쪽에 붙는 타임라인 커넥터: 점-세로선-점 + 이동정보 뱃지
                                                    <div className="flex items-center gap-3 pl-4 py-2">
                                                        <div className="flex flex-col items-center h-10 shrink-0">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-mist shrink-0" />
                                                            <span className="w-px flex-1 bg-pebble" />
                                                            <span className="w-1.5 h-1.5 rounded-full bg-mist shrink-0" />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-paper rounded-badge px-2.5 py-1 text-xs text-cool-ash">
                                                            <Car className="w-3.5 h-3.5 shrink-0" />
                                                            <span>{(leg.distance / 1000).toFixed(1)}km · 약 {Math.round(leg.duration / 60)}분</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    !isLast && <div className="h-4" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 지도 + 경로 요약 */}
                            <div className="flex-1 border border-pebble rounded-flat overflow-hidden shrink-0 flex flex-col">
                                <h3 className="text-deep-ink font-bold p-4 pb-2 shrink-0">
                                    {selectedDay}일차 경로
                                </h3>

                                <div className="flex-1">
                                    {kakaoLoading ? (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-cool-ash bg-mist/20">
                                            지도를 불러오는 중...
                                        </div>
                                    ) : kakaoError ? (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-cool-ash bg-mist/20">
                                            지도를 불러오지 못했습니다.
                                        </div>
                                    ) : (
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        {showActionButtons && (
                            <div className="border-t border-pebble px-8 py-5 shrink-0 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleLike}
                                    className="rounded-pill border border-pebble bg-pure-white text-deep-ink px-6 py-2.5 text-sm font-semibold"
                                >
                                    찜하기
                                </button>
                                {/* 이 화면의 핵심 CTA라 clay-ember 사용. 텍스트는 흰색 대비(3.13:1)가 기준 미달이라
                                    deep-ink로 씀(대비 6.36:1) - 지난 라운드에 확정한 CTA 색 조합 규칙 */}
                                <button
                                    type="button"
                                    onClick={handleCopyToMyTravel}
                                    className="rounded-pill bg-clay-ember text-deep-ink px-6 py-2.5 text-sm font-semibold"
                                >
                                    수정해서 내 여행으로 저장
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )

}