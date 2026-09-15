// Redux toolkit - 액션이라는 메시지 던지면(dispatch) -> 받아서 상태를 바꾸는 규칙(reducer)이 따로 있음
// 로그인/로그아웃 처리 방법이 적힌 설명서

import { createSlice } from '@reduxjs/toolkit'

const storedAccessToken = localStorage.getItem('accessToken')
const storedRefreshToken = localStorage.getItem('refreshToken')

const authSlice = createSlice({

    name: 'auth', // slice name

    initialState: {
        // 처음 상태 정의하기
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
        isLoggedIn: !!storedAccessToken ? true : false,
    },

    reducers: {
        // 상태 바꾸는 함수 정의
        // 매개변수 이름 state, action 으로 고정되어있음
        logout: (state) => {
            state.accessToken = null
            state.refreshToken = null
            state.isLoggedIn = false
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('isLoggedIn')
        }, 
        
        // action.payload 안에 내용물이 담겨있음
        login: (state, action) => {
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
            state.isLoggedIn = true
            localStorage.setItem('accessToken', action.payload.accessToken)
            localStorage.setItem('refreshToken', action.payload.refreshToken)
            localStorage.setItem('isLoggedIn', 'true')
        }
    }
})

// 만든 2개의 액션 export 하기
export const { login, logout } = authSlice.actions
export default authSlice.reducer