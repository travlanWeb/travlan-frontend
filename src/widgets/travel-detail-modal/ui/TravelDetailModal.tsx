// 여행 상세 보여주는 모달 (타임라인 + 지도)

import { useState, useEffect } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelDetail, UserProfile } from '../../../entities/travel/model/types'
import type { Place } from '../../../entities/place/model/types'
import KakaoMap from '../../kakao-map/ui/KakaoMap'

interface TravelDetailModalProps {
    travelId: number | null // null 이면 모달 닫혀있는 상태
    onClose: () => void // 닫기 버튼 눌렀을 때 부모에게 알림
    onNavigateToOriginal?: (originalTravelId: number) => void
}



export default function TravelDetailModal({ travelId, onClose, onNavigateToOriginal }: TravelDetailModalProps) {
    const [detail, setDetail] = useState<TravelDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [author, setAuthor] = useState<UserProfile | null>(null) // 작성자 정보만 새로 추가
    const [originalAuthor, setOriginalAuthor] = useState<UserProfile | null>(null) // 원작자 표시

    useEffect(() => {
        if (travelId === null) return

        setDetail(null)
        setAuthor(null) // 작성자 정보도 같이 초기화
        setError(null)
        setIsLoading(true)
        setOriginalAuthor(null)

        const fetchDetail = async () => {
            try {
                const response = await api.get(`/travels/${travelId}`)
                setDetail(response.data)
                console.log('originalId:', response.data.originalId)

                const authorResponse = await api.get(`/users/${response.data.userId}`)
                setAuthor(authorResponse.data)

                // 원작자 조회 - originalId가 있을 때만
                if (response.data.originalId) {
                    const originalTravelResponse = await api.get(`/travels/${response.data.originalId}`)
                    const originalAuthorResponse = await api.get(`/users/${originalTravelResponse.data.userId}`)
                    setOriginalAuthor(originalAuthorResponse.data)
                }
            } catch (err) {
                console.error("여행 상세 조회 실패", err)
                setError("여행 정보를 불러오지 못했습니다.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchDetail()
    }, [travelId])

    // day -> visitOrder 순으로 정렬해서 타임라인 순서 그대로 보여주기
    const sortedVisits = detail
        ? [...detail.visits].sort((a, b) => a.day - b.day || a.visitOrder - b.visitOrder)
        : []



    // KakaoMap은 Place[]를 받는 위젯이라 bags(TravelBagItem[])를 Place 형태로 변환
    const bagPlaces: Place[] = detail
        ? detail.bags.map((bag) => ({
            id: bag.id,
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

    if (travelId === null) return null



    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-flat p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <button onClick={onClose} className="float-right">닫기</button>

                {isLoading && <p>불러오는 중...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {detail && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{detail.name}</h2>
                                {author && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        작성자: {author.name}
                                    </p>
                                )}
                                {originalAuthor && detail.originalId && (
                                    <button
                                        onClick={() => onNavigateToOriginal?.(detail.originalId!)}
                                        className="text-sm text-blue-500 underline mt-1"
                                    >
                                        원작: {originalAuthor.name}님의 여행 보러가기
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                className="text-sm text-gray-400 cursor-not-allowed"
                                disabled
                                title="준비 중인 기능입니다"
                            >
                                내 여행으로 복사하기
                            </button>
                        </div>

                        {bagPlaces.length > 0 && (
                            <section className="mb-6">
                                <div className="h-64 w-full">
                                    {/* 읽기 전용: onMarkerClick을 안 넘겨서 핀 클릭해도 아무 동작 안 함, showBagBadges=false로 내 여행가방과 무관하게 기본 핀만 표시 */}
                                    <KakaoMap places={bagPlaces} showBagBadges={false} />
                                </div>
                            </section>
                        )}

                        <section className="mb-6">
                            <h3 className="font-semibold mb-2">담긴 장소</h3>
                            {detail.bags.length === 0 ? (
                                <p className="text-sm text-gray-500">담긴 장소가 없습니다.</p>
                            ) : (
                                <ul className="list-disc list-inside">
                                    {detail.bags.map((bag) => (
                                        <li key={bag.id}>{bag.placeName}</li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">타임라인</h3>
                            {sortedVisits.length === 0 ? (
                                <p className="text-sm text-gray-500">등록된 일정이 없습니다.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {sortedVisits.map((visit) => (
                                        <li key={visit.id} className="text-sm">
                                            <span className="text-gray-500">Day {visit.day}</span>{' '}
                                            {visit.startTime.slice(0, 5)} - {visit.endTime.slice(0, 5)} · {visit.name} · {visit.cost.toLocaleString()}원
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}