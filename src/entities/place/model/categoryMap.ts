// 숫자 코드 & 한글 라벨 매핑
// 여러 코드 한 개로 묶이는 경우 존재함

export const CATEGORY_FILTERS = ['전체', '관광', '숙박', '쇼핑', '음식점', '카페']

// 카테고리별 마커 색상 (지도 핀 구분용)
export const CATEGORY_COLORS: Record<string, string> = {
  '관광': '#E8623A',   // clay-ember 계열 (브랜드 오렌지)
  '숙박': '#5B8DEF',   // 파란 계열
  '쇼핑': '#F5A623',   // 노란/골드 계열
  '음식점': '#E0574C', // 빨간 계열
  '카페': '#6B8E5A',   // 초록 계열
}

// 카테고리별 기본 이용 시간(분) - 시작 시간 선택 시 종료 시간 자동 계산에 사용
// 숙박은 체크인/아웃이 제각각이라 자동 계산 안 함 (null)
export const CATEGORY_DURATION_MINUTES: Record<string, number | null> = {
  '관광': 120,
  '카페': 60,
  '음식점': 60,
  '쇼핑': 120,
  '숙박': null,
}

// 매핑에 없는 카테고리가 오면 쓸 기본색
export const DEFAULT_MARKER_COLOR = '#8e8e95' // cool-ash