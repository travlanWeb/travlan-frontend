// 숫자 코드 & 한글 라벨 매핑
// 여러 코드 한 개로 묶이는 경우 존재함

export const CATEGORY_FILTERS = ['전체', '관광', '숙박', '쇼핑', '음식점', '카페']

// 카테고리별 마커 색상 (지도 핀 구분용)
export const CATEGORY_COLORS: Record<string, string> = {
  '관광': '#8e8e95',   // clay-ember
  '숙박': '#8e8e95',   // 파란 계열
  '쇼핑': '#8e8e95',   // 노란 계열
  '음식점': '#8e8e95', // 빨간 계열
  '카페': '#8e8e95',   // 초록 계열
}

// 매핑에 없는 카테고리가 오면 쓸 기본색
export const DEFAULT_MARKER_COLOR = '#8e8e95' // cool-ash