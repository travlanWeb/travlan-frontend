// 커스텀 훅 만들기

import type { Place } from "./types"
import { useEffect, useState } from "react"
import { api } from "../../../shared/api/axiosInstance"

export function usePlaces() {
    const [places, setPlaces] = useState<Place[]>([])

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const response = await api.get('/places')

                // 위경도 없는 데이터 걸러내기
                const validPlaces = response.data.filter(
                    (place: Place) => place.latitude && place.longitude
                )

                setPlaces(validPlaces)
            } catch (error) {
                console.log('장소 목록 조회 실패', error)
            }
        }
        fetchPlaces()
    }, [])

    return places
}