import { create } from 'zustand'

// 기본 구현 당시 mainpage 안에 useState 로 저장했던 이름/기간/예산 데이터
// 타임라인으로 보내기 위해 컴포넌트 밖 독립 저장소 생성

interface TravelDraftState {
    name: string
    startDate: string
    endDate: string
    totalBudget: number
    setName: (name: string) => void
    setStartDate: (startDate: string) => void
    setEndDate: (endDate: string) => void
    setTotalBudget: (totalBudget: number) => void
}

export const useTravelDraftStore = create<TravelDraftState>((set) => ({
    name: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    setName: (name) => set({name}),
    setStartDate: (startDate) => set({startDate}),
    setEndDate: (endDate) => set({endDate}),
    setTotalBudget: (totalBudget) => set({totalBudget}),
}))
