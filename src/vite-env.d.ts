/// <reference types="vite/client" />

// import.meta.env로 접근하는 환경변수들의 타입을 TS에게 알려주는 부분
// 안 하면 "그런 속성 없다"는 타입 에러가 남
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}