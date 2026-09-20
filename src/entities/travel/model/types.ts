// Travel 타입 지정

export interface Travel {
    id: number
    userId: number
    name: string
    totalBudget: number
    startDate: string | null
    endDate: string | null
    createdAt: string
    updatedAt: string
}

// visit 타입 정의 -> swagger 그대로

export interface Visit {
    placeId: number
    day: number
    cost: number
    visitOrder: number
    startTime: string
    endTime: string
}

export interface TravelCard {
    id: number
    name: string
    userId: number
    originalId: number | null
    totalBudget: number
    status: string
    saveCount: number
    edited: boolean
    startDate: string
    endDate: string
    updatedAt: string
}

// bags 배열 안의 항목 하나
export interface TravelBagItem {
    id: number
    placeId: number
    placeName: string
    address: string
    latitude: number
    longitude: number
}


// visits 배열 안의 항목 하나
export interface TravelVisitItem {
    id: number
    day: number
    cost: number
    visitOrder: number
    startTime: string
    endTime: string
    placeId: number
    name: string
    address: string
    latitude: number
    longitude: number
}

// 상세 조회 응답 전체
export interface TravelDetail {
  id: number
  name: string
  userId: number
  originalId: number | null
  totalBudget: number
  status: string
  startDate: string
  endDate: string
  updatedAt: string
  bags: TravelBagItem[]
  visits: TravelVisitItem[]
}

// GET /users/{id} 응답
export interface UserProfile {
  id: number
  name: string
  profileImage: string
}


// GET /travels/mine 응답
export interface MyTravelCard {
  id: number
  name: string
  userId: number
  originalId: number | null
  edited: boolean // 리믹스 등
  totalBudget: number
  status: string
  saveCount: number // 받은 찜 개수 추가
  startDate: string
  endDate: string
  updatedAt: string
}

export interface RouteLeg {
    fromVisitId: number
    toVisitId: number
    distance: number // km
    duration: number // minute
    available: boolean
}

export interface DayRoute {
    day: number
    legs: RouteLeg[]
}