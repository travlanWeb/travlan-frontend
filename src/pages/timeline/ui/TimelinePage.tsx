// 백엔드 연동 전 목업 데이터 넣어둠
// visits 가져오기 추가(9/16)

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addVisit, updateVisit, clearVisits } from "../../../entities/travel/model/visitSlice"
import type { RootState } from "../../../app/store"
import { useBagStore } from "../../../entities/bag/model/useBagStore"
import { getUserIdFromToken } from "../../../entities/auth/model/getUserId"
import { api } from "../../../shared/api/axiosInstance"
import { useTravelDraftStore } from "../../../entities/travel/model/useTravelDraftStore"
import { useNavigate } from "react-router-dom"
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk"

export default function TimelinePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const bagItems = useBagStore((state) => state.items)
  const visits = useSelector((state: RootState) => state.visit.items)
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const { name, startDate, endDate, totalBudget } = useTravelDraftStore()

  // 여행가방 중에서 "타임라인에 포함하기로 선택한" 장소의 id 목록
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const bags = bagItems.map((place) => ({ placeId: place.id }))

  // 체크박스 토글 - 선택하면 visit을 새로 만들고, 해제하면 visit도 지움
  const toggleSelect = (placeId: number) => {
    const place = bagItems.find((item) => item.id === placeId)
    if (!place) return

    if (selectedIds.includes(placeId)) {
      // 선택 해제 - visits에서도 제거
      setSelectedIds((prev) => prev.filter((id) => id !== placeId))
      dispatch(clearVisits()) // 아래에서 다시 채울 거라 일단 비움 (간단한 재계산 방식)
    } else {
      setSelectedIds((prev) => [...prev, placeId])
      dispatch(addVisit({
        placeId: place.id,
        day: 1,
        cost: place.price ?? 0,
        visitOrder: selectedIds.length + 1,
        startTime: '',
        endTime: '',
      }))
    }
  }

  const handleSave = async (endpoint: string) => {
    if (!accessToken) return
    const userId = getUserIdFromToken(accessToken)

    const formattedVisits = visits.map((visit) => ({
      ...visit,
      startTime: visit.startTime ? visit.startTime + ':00' : '00:00:00',
      endTime: visit.endTime ? visit.endTime + ':00' : '00:00:00',
    }))

    const payload = { userId, name, totalBudget, startDate, endDate, bags, visits: formattedVisits }

    try {
      const response = await api.post(endpoint, payload)
      console.log("저장 성공", response.data)
      navigate('/mypage')
    } catch (error) {
      console.error("저장 실패", error)
    }
  }

  // 지도에 찍을 좌표들 - visitOrder 순서대로 정렬
  const timelinePlaces = visits
    .slice()
    .sort((a, b) => a.visitOrder - b.visitOrder)
    .map((visit) => bagItems.find((item) => item.id === visit.placeId))
    .filter((place): place is typeof bagItems[number] => place !== undefined)

  const mapCenter = timelinePlaces.length > 0
    ? { lat: timelinePlaces[0].latitude, lng: timelinePlaces[0].longitude }
    : { lat: 35.8562, lng: 129.2247 } // 경주 기본값

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-8">
      {/* 여행 정보 바 */}
      <div className="border-b border-pebble pb-6 mb-6">
        <h1 className="text-2xl font-bold text-deep-ink mb-2">{name || '여행 이름'}</h1>
        <div className="flex gap-6 text-sm text-cool-ash">
          <span>{startDate} ~ {endDate}</span>
          <span>총 예산 {totalBudget.toLocaleString()}원</span>
        </div>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* 여행가방 - 체크해서 타임라인에 포함 */}
        <div className="w-64 border border-pebble rounded-flat p-4 overflow-y-auto">
          <h2 className="text-deep-ink font-bold mb-3">여행가방 ({bagItems.length})</h2>
          {bagItems.map((place) => (
            <label key={place.id} className="flex items-center gap-2 py-2 border-b border-pebble cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.includes(place.id)}
                onChange={() => toggleSelect(place.id)}
              />
              <span className="text-sm text-deep-ink">{place.name}</span>
            </label>
          ))}
        </div>

        {/* 일정 목록 - 선택된 것만 표시 */}
        <div className="flex-1 border border-pebble rounded-flat p-4 overflow-y-auto">
          <h2 className="text-deep-ink font-bold mb-3">일정</h2>
          {visits.length === 0 && (
            <p className="text-sm text-cool-ash">왼쪽에서 여행가방 항목을 선택하면 일정에 추가됩니다.</p>
          )}
          {visits
            .slice()
            .sort((a, b) => a.visitOrder - b.visitOrder)
            .map((visit) => {
              const place = bagItems.find((item) => item.id === visit.placeId)
              if (!place) return null

              return (
                <div key={visit.placeId} className="mb-4 pb-4 border-b border-pebble">
                  <p className="font-semibold text-deep-ink mb-2">{place.name}</p>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="number"
                      placeholder="며칠째"
                      value={visit.day}
                      onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'day', value: Number(e.target.value) }))}
                      className="border border-pebble px-2 py-1 text-sm w-20"
                    />
                    <input
                      type="number"
                      placeholder="비용"
                      value={visit.cost}
                      onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'cost', value: Number(e.target.value) }))}
                      className="border border-pebble px-2 py-1 text-sm w-24"
                    />
                    <input
                      type="number"
                      placeholder="순서"
                      value={visit.visitOrder}
                      onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'visitOrder', value: Number(e.target.value) }))}
                      className="border border-pebble px-2 py-1 text-sm w-16"
                    />
                    <input
                      type="time"
                      value={visit.startTime}
                      onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'startTime', value: e.target.value }))}
                      className="border border-pebble px-2 py-1 text-sm"
                    />
                    <input
                      type="time"
                      value={visit.endTime}
                      onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'endTime', value: e.target.value }))}
                      className="border border-pebble px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              )
            })}
        </div>

        {/* 지도 - 순서대로 핀 + 직선 경로 */}
        <div className="w-96 border border-pebble rounded-flat overflow-hidden">
          <Map center={mapCenter} style={{ width: '100%', height: '100%' }} level={9}>
            {timelinePlaces.map((place, index) => (
              <MapMarker key={place.id} position={{ lat: place.latitude, lng: place.longitude }}>
                <div className="text-xs px-1">{index + 1}. {place.name}</div>
              </MapMarker>
            ))}

            {timelinePlaces.length > 1 && (
              <Polyline
                path={timelinePlaces.map((place) => ({ lat: place.latitude, lng: place.longitude }))}
                strokeWeight={3}
                strokeColor="#000d10"
                strokeOpacity={0.8}
                strokeStyle="solid"
              />
            )}
          </Map>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handleSave('/travels/temp')}
          className="rounded-pill border border-pebble text-deep-ink px-6 py-2.5 text-sm font-semibold"
        >
          임시저장
        </button>
        <button
          onClick={() => handleSave('/travels')}
          className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold"
        >
          여행 저장하기
        </button>
      </div>
    </div>
  )
}