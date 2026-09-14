// 백엔드 연동 전 목업 데이터 넣어둠

import { mockTravel } from "../../../entities/travel/model/mockTravel"

export default function TimelinePage() {
    const travel = mockTravel // api 연동 필요

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
                <div className="w-64 border border-gray-200 rounded-card p-4 text-gray-400 text-center">
                    여행가방 영역 준비 중...
                </div>
                <div className="flex-1 border border-gray-200 rounded-card p-4 text-gray-400 text-sm text-center">
                    일정 목록 영역 준비 중
                </div>
                <div className="w-72 border border-gray-200 rounded-card p-4 text-gray-400 text-sm text-center">
                    지도 영역 준비 중
                </div>
            </div>
        </div>
    )
}