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

