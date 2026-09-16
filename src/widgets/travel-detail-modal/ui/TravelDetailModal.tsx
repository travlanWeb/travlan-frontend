// 여행 상세 보여주는 모달 (타임라인 + 지도)

import { useState, useEffect } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { TravelDetail } from '../../../entities/travel/model/types'

interface TravelDetailModalProps{
    travelId: number | null // null 이면 모달 닫혀있는 상태
    onClose: () => void // 닫기 버튼 눌렀을 때 부모에게 알림
}


export default function TravelDetailModal({ travelId, onClose }: TravelDetailModalProps) {
    const [detail, setDetail] = useState<TravelDetail | null>(null)

    useEffect(() => {
        if (travelId === null) return // 안 열려있으면 아무것도 안 함

        const fetchDetail = async () => {
            try {
                const response = await api.get(`'/travels/${travelId}`)
                setDetail(response.data)
            } catch (error) {
                console.error("여행 상세 조회 실패", error)
            }
        }
        fetchDetail()
    }, [travelId]) // travelId 가 바뀔 때마다 (모달 열릴 때마다) 다시 조회하기

    if (travelId === null) return null

    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="float-right">닫기</button>
        {detail && (
          <>
            <h2 className="text-xl font-bold mb-4">{detail.name}</h2>
            {/* 여기에 bags(지도용), visits(타임라인용) 표시 예정 */}
          </>
        )}
      </div>
    </div>
  )
}