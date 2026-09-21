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
  // 커뮤니티에서 "수정해서 내 여행으로 저장"으로 방금 데이터를 채워 넣고
  // /travels/new/map으로 넘어온 직후인지 표시하는 1회성 플래그.
  // MainPage가 "새 여행 시작"과 "리믹스 직후"를 구분하지 못해서
  // 방금 복사해 넣은 데이터를 초기화 로직이 지워버리는 문제를 막기 위함
  justCopied: boolean
  setName: (name: string) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setTotalBudget: (budget: number) => void
  setOriginalId: (id: number | null) => void // 추가
  setTravelImage: (url: string | null) => void
  setJustCopied: (value: boolean) => void
}

export const useTravelDraftStore = create<TravelDraftState>((set) => ({
  name: '',
  startDate: '',
  endDate: '',
  totalBudget: 0,
  originalId: null, // 초기값
  travelImage: null,
  justCopied: false,
  setName: (name) => set({ name }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setTotalBudget: (budget) => set({ totalBudget: budget }),
  setOriginalId: (id) => set({ originalId: id }), // 추가
  setTravelImage: (url) => set({ travelImage: url }),
  setJustCopied: (value) => set({ justCopied: value }),
}))