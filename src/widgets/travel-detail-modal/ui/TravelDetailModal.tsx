// 여행 상세 보여주는 모달 (타임라인 + 지도)

import { useState, useEffect } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelDetail } from '../../../entities/travel/model/types'
import type { Place } from '../../../entities/place/model/types'
import KakaoMap from '../../kakao-map/ui/KakaoMap'

interface TravelDetailModalProps{
    travelId: number | null // null 이면 모달 닫혀있는 상태
    onClose: () => void // 닫기 버튼 눌렀을 때 부모에게 알림
}


export default function TravelDetailModal({ travelId, onClose }: TravelDetailModalProps) {
    const [detail, setDetail] = useState<TravelDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (travelId === null) return // 안 열려있으면 아무것도 안 함

        // 모달을 다시 열 때 이전 travelId의 상세 데이터가 잠깐이라도 보이지 않도록 초기화
        setDetail(null)
        setError(null)
        setIsLoading(true)

        const fetchDetail = async () => {
            try {
                const response = await api.get(`/travels/${travelId}`)
                setDetail(response.data)
            } catch (err) {
                console.error("여행 상세 조회 실패", err)
                setError("여행 정보를 불러오지 못했습니다.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchDetail()
    }, [travelId]) // travelId 가 바뀔 때마다 (모달 열릴 때마다) 다시 조회하기

    if (travelId === null) return null

    // day -> visitOrder 순으로 정렬해서 타임라인 순서 그대로 보여주기
    const sortedVisits = detail
        ? [...detail.visits].sort((a, b) => a.day - b.day || a.visitOrder - b.visitOrder)
        : []

    // KakaoMap은 Place[]를 받는 위젯이라 bags(TravelBagItem[])를 Place 형태로 변환
    // category/imgUrl 등 지도 렌더링에 쓰이지 않는 필드는 빈 값으로 채움
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

    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-flat p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="float-right">닫기</button>

        {isLoading && <p>불러오는 중...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {detail && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{detail.name}</h2>
              {/*
                TODO: 복사(remix) 기능 - GET /travels 응답에 userId가 없어서
                지금은 "내 여행"과 "남의 여행"을 구분할 방법이 없음. 전부 읽기 전용으로 취급 중.
                백엔드에 originTravelId/allowCopy 필드, GET /travels의 userId 추가가 확정되면
                본인 소유가 아닌 경우에만 이 버튼을 노출하고, 클릭 시
                POST /travels에 originTravelId를 포함해 복사본을 새 여행으로 저장하도록 연결할 것.
              */}
              <button
                type="button"
                className="text-sm text-gray-400 cursor-not-allowed"
                disabled
                title="준비 중인 기능입니다"
              >
                복사해서 내 여행으로 만들기
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