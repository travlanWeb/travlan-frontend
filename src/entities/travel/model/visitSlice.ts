import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Visit } from "./types";

interface VisitState {
    items: Visit[]
}

const initialState: VisitState = {
    items: [],
}

const visitSlice = createSlice({
    name: 'visit',
    initialState,
    reducers: {
        // 중복 요청으로 인한 방어 로직 추가함
        addVisit: (state, action) => {
            const alreadyExists = state.items.some(
                (item) => item.placeId === action.payload.placeId && item.day === action.payload.day)
            if (alreadyExists) return
            state.items.push(action.payload)
        },

        // 기존 형태 오류로 인해 ai 디버깅 진행함

        updateVisit: (
            state,
            action: PayloadAction<{ placeId: number; day: number; field: keyof Visit; value: string | number }>
        ) => {
            const visit = state.items.find((item) => item.placeId === action.payload.placeId && item.day === action.payload.day)
            if (visit) {
                visit[action.payload.field] = action.payload.value as never
            }
        },


        clearVisits: (state) => {
            state.items = []
        },

        removeVisit: (state, action: PayloadAction<{ placeId: number; day: number }>) => {
            state.items = state.items.filter(
                (visit) => !(visit.placeId === action.payload.placeId && visit.day === action.payload.day)
            )
        },

        // 여행가방에서 장소 자체를 삭제할 때 쓰는 reducer.
        // removeVisit은 "특정 day의 일정에서만" 빼는 거라 placeId+day를 같이 받는데,
        // 여행가방에서 삭제하는 경우엔 그 장소가 어느 day에 일정으로 들어가 있든
        // 전부 다 지워야 해서 day 상관없이 placeId만으로 필터링함
        removeVisitsByPlaceId: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((visit) => visit.placeId !== action.payload)
        },
    },
})

// 3개 reducer export 처리
export const { addVisit, updateVisit, clearVisits, removeVisit, removeVisitsByPlaceId } = visitSlice.actions
export default visitSlice.reducer