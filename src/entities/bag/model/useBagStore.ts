import { create } from 'zustand'
import type { Place } from "../../place/model/types"

interface BagState {
    items: Place[] 
    addItem: (place: Place) => void // addItems -> addItem으로 수정
    removeItem: (placeId: number) => void // boolean -> void로 수정
    isInBag: (placeId: number) => boolean
}

export const useBagStore = create<BagState>((set, get) => ({ 
    items: [], 

    addItem: (place) => {
        const alreadyInBag = get().items.some((item) => item.id === place.id)
        if (alreadyInBag) return

        set((state) => ({ items: [...state.items, place] }))    
    },

    removeItem: (placeId) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== placeId),
        }))
    },

    isInBag: (placeId) => {
        return get().items.some((item) => item.id === placeId)
    },
}))