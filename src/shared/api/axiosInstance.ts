import axios from 'axios'
import { store } from '../../app/store'

// axios.create() : 공통 설정 적용된 전용 axios 인스턴스 생성
// api.get('/travels') 처럼 짧게 호출이 가능함

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000, // 백엔드 무응답 시 무한 대기 방지용
})

const currentState = store.getState()

// 인터셉터 - 요청과 응답이 오가는 길에서 공통 처리를 끼워넣음
// 로그인 기능 생성 시 토큰을 헤더에 자동으로 붙이는 로직 추가 예정

api.interceptors.request.use((config) => {
    // 만약 로그인되어 있다면, 헤더에 토큰을 붙여서 보내라 -> 로직 넣어서 어디서 호출하든 토큰 실리게 하기

    const token = currentState.auth.accessToken
    console.log('인터셉터에서 확인한 토큰:', token) // 임시 확인용

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
})