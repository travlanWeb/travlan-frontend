// 커스텀 훅 생성

import { useState, useEffect } from 'react'
import { api } from '../../../shared/api/axiosInstance'
import type { MyTravelCard } from './types'

export function useMyTravels() {
    const [myTravels, setMyTravels] = useState<MyTravelCard[]>([])

    useEffect(() => {
        const fetchMyTravels = async () => {
            try {
                const response = await api.get('/travels/mine')
                setMyTravels(response.data)
            } catch (error) {
                console.error('내 여행 목록 조회 실패', error)
            }
        }
        fetchMyTravels()
    }, [])

    return myTravels
}