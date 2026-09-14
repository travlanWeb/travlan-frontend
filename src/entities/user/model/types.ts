export interface User {
    id: number
    name: string
    email: string
    provider: string
    providerId: string | null
    createdAt: string
}

export interface SignupRequest {
    name: string
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}