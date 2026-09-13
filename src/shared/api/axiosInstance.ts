import axios from 'axios'

// axios.create() : 공통 설정 적용된 전용 axios 인스턴스 생성
// api.get('/travels') 처럼 짧게 호출이 가능함

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000, // 백엔드 무응답 시 무한 대기 방지용
})

// 인터셉터 - 요청과 응답이 오가는 길에서 공통 처리를 끼워넣음
// 로그인 기능 생성 시 토큰을 헤더에 자동으로 붙이는 로직 추가 예정

api.interceptors.request.use((config) => {
    // Todo: 로그인 구현한 후에 저장된 토큰 헤더에 붙이기
    return config
})