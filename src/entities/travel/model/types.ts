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