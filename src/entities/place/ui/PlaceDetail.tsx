import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore";

interface PlaceDetailProps {
    place: Place | null // 선택된 장소, 아무것도 선택 안 됐으면 null 
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
    const addItem = useBagStore((state) => state.addItem)
    const removeItem = useBagStore((state) => state.removeItem)
    const isInBag = useBagStore((state) =>
        place ? state.isInBag(place.id) : false
    )

    // 아무것도 선택 안 된 상태
    if (!place) {
        return (
            <div className="border rounded-card p-6 h-full flex items-center justify-center text-gray-400 text-sm">
                여행지를 선택하면 상세 정보가 여기에 표시됩니다.
            </div>
        )
    }

    const handleToggleBag = () => {
        if (isInBag) {
            removeItem(place.id)
        } else {
            addItem(place)
        }
    }

    return (
        <div className="border rounded-card p-6 h-full flex flex-col gap-3">
            <div>
                <h3 className="text-lg font-bold">{place.name}</h3>
                <p className="text-sm text-gray-500">{place.category}</p>
            </div>

            <p className="text-sm text-gray-700">{place.address}</p>

            {/* price는 nullable이라 있을 때만 표시 */}
            {place.price !== null && (
                <p className="text-sm font-semibold">{place.price.toLocaleString()}원</p>
            )}

            <button
                onClick={handleToggleBag}
            >
                {isInBag ? '여행가방에서 빼기' : '여행가방에 담기'}
            </button>
        </div>
    )
}