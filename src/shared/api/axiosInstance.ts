import axios from 'axios'
import { store } from '../../app/store'
import { refreshTokens, logout } from '../../entities/auth/model/authSlice'

// axios.create() : 공통 설정 적용된 전용 axios 인스턴스 생성
// api.get('/travels') 처럼 짧게 호출이 가능함

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000, // 백엔드 무응답 시 무한 대기 방지용
})

// const currentState = store.getState()

// 인터셉터 - 요청과 응답이 오가는 길에서 공통 처리를 끼워넣음
// 로그인 기능 생성 시 토큰을 헤더에 자동으로 붙이는 로직 추가 예정

api.interceptors.request.use((config) => {
    // 만약 로그인되어 있다면, 헤더에 토큰을 붙여서 보내라 -> 로직 넣어서 어디서 호출하든 토큰 실리게 하기

    const token = store.getState().auth.accessToken

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})



// refreshToken - 응답 인터셉터 추가하기 : 토큰 만료로 인한 재로그인 방지


api.interceptors.response.use(
    (response) => response, // 성공 시 그대로 통과하도록 함
    async (error) => {
        // 실패 시 여기로 돌아옴, 401 확인 후 복구 시도함
        const originalRequest = error.config // 실패했던 원래 요청 정보

        // 401 error & 재시도 아직 안 한 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true // 계속해서 요청하는 걸 방지하기 위해 (무한루프 방지)

            const refreshToken = store.getState().auth.refreshToken

            if (!refreshToken) {
                store.dispatch(logout())
                return Promise.reject(error)
            }

            try {
                // 재발급 api 호출
                const response = await api.post('/auth/reissue', { refreshToken })

                // dispatch(refreshTokens(...)) 으로 store 업데이트하기
                store.dispatch(refreshTokens(response.data))

                // originalRequest 헤더를 새 토큰으로 교체 후 재시도
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
                return api(originalRequest)

            } catch (refreshError) {
                store.dispatch(logout())
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)