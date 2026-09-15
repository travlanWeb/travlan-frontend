// 실제로 일하게 배치할 사무실(store) 만들기 (쉽게 이해하기))
// authSlice 에서 만든 설명서를 직접 사용할 진짜 저장 창고

import { configureStore } from "@reduxjs/toolkit"; // authSlice 만든 파일에서 reducer 가져오기
import authReducer from '../entities/auth/model/authSlice'

// authSlice 파일에서 default 로 내보냈기 때문에 가져오는 쪽에서 이름 자유롭게 선택 가능

export const store = configureStore({

    reducer: {
        auth: authReducer, // 창고 안에 auth 라는 이름의 칸을 만들고, 매뉴얼을 넣어라 
    },
})

// type export 해주기 - 타입 직접 쓰지 않고 export (유지보수 용이)
export type RootState = ReturnType<typeof store.getState> 