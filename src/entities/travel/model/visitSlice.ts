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
        addVisit: (state, action) => {
            state.items.push(action.payload)
        },

        // 기존 형태 오류로 인해 ai 디버깅 진행함

        updateVisit: (
            state,
            action: PayloadAction<{ placeId: number; field: keyof Visit; value: string | number }>
        ) => {
            const visit = state.items.find((item) => item.placeId === action.payload.placeId)
            if (visit) {
                visit[action.payload.field] = action.payload.value as never // 이 부분은 내가 책임질 테니 타입 체크를 넘어가라
            }
        },


        clearVisits: (state) => {
            state.items = []
        }
    },
})

// 3개 reducer export 처리
export const { addVisit, updateVisit, clearVisits } = visitSlice.actions
export default visitSlice.reducer