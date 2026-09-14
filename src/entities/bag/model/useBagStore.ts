import { create } from 'zustand'
import type { Place } from "../../place/model/types"

// 여행가방이 가져야 할 것들 우선 정의
interface BagState {
    items: Place[] // 여행가방에 담긴 장소 배열
    addItem: (place: Place) => void // 장소 하나 받아서 담기
    removeItem: (placeId: number) => void // 장소 빼기
    isInBag: (placeId: number) => boolean // id 받아서 참/거짓 반환 (여행가방 안에 있는지 없는지)
}

// BagState 의 형태를 하고 있는 BagStore 생성
export const useBagStore = create<BagState>((set, get) => ({ 
    items: [], // items 빈 배열로 설정해두기

    addItem: (place) => { // 장소 추가하기
        const alreadyInBag = get().items.some((item) => item.id === place.id)
        if (alreadyInBag) return // 이미 가방 안에 있다면 그냥 return

        set((state) => ({ items: [...state.items, place] })) // 가방 안에 없다면 기존 아이템들 ... 으로 불러와서 place 추가하기
    },

    removeItem: (placeId) => { // 장소 삭제하기
        set((state) => ({
            items: state.items.filter((item) => item.id !== placeId), // placeId 와 다른 것들만 남김 = place 만 삭제됨
        }))
    },

    isInBag: (placeId) => { // 가방 안에 있는지 확인
        return get().items.some((item) => item.id === placeId) // 가방에 place 있다면 true, 없으면 false로 반환
    },
}))