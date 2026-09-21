import { create } from 'zustand'

// 기본 구현 당시 mainpage 안에 useState 로 저장했던 이름/기간/예산 데이터
// 타임라인으로 보내기 위해 컴포넌트 밖 독립 저장소 생성

interface TravelDraftState {
  name: string
  startDate: string
  endDate: string
  totalBudget: number
  originalId: number | null // 추가 - 복사해서 시작한 여행이면 원본 id를 기억
  travelImage: string | null // 추가 - 여행 사진 업로드 기능 추가
  setName: (name: string) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setTotalBudget: (budget: number) => void
  setOriginalId: (id: number | null) => void // 추가
  setTravelImage: (url: string | null) => void
}

export const useTravelDraftStore = create<TravelDraftState>((set) => ({
  name: '',
  startDate: '',
  endDate: '',
  totalBudget: 0,
  originalId: null, // 초기값
  travelImage: null,
  setName: (name) => set({ name }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setTotalBudget: (budget) => set({ totalBudget: budget }),
  setOriginalId: (id) => set({ originalId: id }), // 추가
  setTravelImage: (url) => set({ travelImage: url }),
}))
