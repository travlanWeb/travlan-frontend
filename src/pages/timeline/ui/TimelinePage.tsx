// 백엔드 연동 전 목업 데이터 넣어둠
// visits 가져오기 추가(9/16)

import { mockTravel } from "../../../entities/travel/model/mockTravel"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addVisit, updateVisit } from "../../../entities/travel/model/visitSlice"
import type { RootState } from "../../../app/store"
import { useBagStore } from "../../../entities/bag/model/useBagStore"
import { getUserIdFromToken } from "../../../entities/auth/model/getUserId"
import { api } from "../../../shared/api/axiosInstance"
import { useTravelDraftStore } from "../../../entities/travel/model/useTravelDraftStore"
import { useNavigate } from "react-router-dom"




export default function TimelinePage() {

    const navigate = useNavigate()

    const dispatch = useDispatch()
    const bagItems = useBagStore((state) => state.items)
    const visits = useSelector((state: RootState) => state.visit.items)

    const travel = mockTravel // api 연동 필요

    // accessToken 가져오기
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)
    const { name, startDate, endDate, totalBudget } = useTravelDraftStore()

    const bags = bagItems.map((place) => ({ placeId: place.id })) // API 요청 형태로 변환





    // 저장 함수
    const handleSave = async (endpoint: string) => {

        if (!accessToken) return // 방어 코드

        const userId = getUserIdFromToken(accessToken)

        const formattedVisits = visits.map((visit) => ({
            ...visit,
            startTime: visit.startTime ? visit.startTime + ':00' : '00:00:00',
            endTime: visit.endTime ? visit.endTime + ':00' : '00:00:00',
        }))

        const payload = {
            userId,
            name,
            totalBudget,
            startDate,
            endDate,
            bags,
            visits: formattedVisits,
        }

        try {
            const response = await api.post(endpoint, payload)
            console.log("저장 성공", response.data)
            navigate('/mypage')
        } catch (error) {
            console.error("저장 실패", error)
        }
    }


    // 
    useEffect(() => {
        bagItems.forEach((place, index) => {
            dispatch(addVisit({ // dispatch 호출 -> addVisit으로 만든 내용을 실제 store 에 전달해서 처리시킴
                placeId: place.id,
                day: 1,
                cost: place.price ?? 0,
                visitOrder: index + 1,
                startTime: '',
                endTime: '',
            }))
        })
    }, []) // 의존성 배열 [] : 페이지 처음 열릴 때 딱 한 번만 실행되도록

    return (
        <div className="max-w-[1200px] mx-auto px-10 py-8">
            {/* 여행 정보 바 */}
            <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-2xl font-bold mb-2">{travel.name}</h1>
                <div className="flex gap-6 text-sm text-gray-500">
                    <span>
                        {travel.startDate} ~ {travel.endDate}
                    </span>
                    <span>총 예산 {travel.totalBudget.toLocaleString()}원</span>
                </div>
            </div>


            <div className="flex gap-6">
                <div className="w-64 border border-gray-200 rounded-flat p-4 text-gray-400 text-center">
                    {bagItems.map((place) => {

                        const visit = visits.find((v) => v.placeId === place.id)
                        if (!visit) return null

                        return (
                            <div key={place.id} className="mb-4 pb-4 border-b">
                                <p className="font-semibold">{place.name}</p>

                                <input
                                    type="number"
                                    placeholder="며칠째"
                                    value={visit.day}
                                    onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'day', value: Number(e.target.value) }))}
                                />

                                <input
                                    type="number"
                                    placeholder="얼마"
                                    value={visit.cost}
                                    onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'cost', value: Number(e.target.value) }))}
                                />

                                <input
                                    type="number"
                                    placeholder="몇 번째"
                                    value={visit.visitOrder}
                                    onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'visitOrder', value: Number(e.target.value) }))}
                                />

                                <input
                                    type="time"
                                    placeholder="시작 시각"
                                    value={visit.startTime}
                                    onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'startTime', value: e.target.value }))}
                                />

                                <input
                                    type="time"
                                    placeholder="끝나는 시각"
                                    value={visit.endTime}
                                    onChange={(e) => dispatch(updateVisit({ placeId: place.id, field: 'endTime', value: e.target.value }))}
                                />

                            </div>
                        )
                    })}
                </div>
                <div className="flex-1 border border-gray-200 rounded-flat p-4 text-gray-400 text-sm text-center">
                    일정 목록 영역 준비 중
                </div>
                <div className="w-72 border border-gray-200 rounded-flat p-4 text-gray-400 text-sm text-center">
                    지도 영역 준비 중
                </div>

                <button
                    onClick={() => handleSave('/travels/temp')}
                    className="rounded-btn bg-primary text-black px-6 py-2 text-sm font-semibold">임시저장</button>
                <button
                    onClick={() => handleSave('/travels')}
                    className="rounded-btn bg-primary text-black px-6 py-2 text-sm font-semibold">여행 저장하기</button>

            </div>
        </div>
    )
}