import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore";

interface PlaceDetailProps {
    place: Place | null // 유니온 타입 -> 선택된 장소, 아무것도 선택 안 됐으면 null 
}

export default function PlaceDetail({ place }: PlaceDetailProps) {

    // zustand 에서 값 꺼내오기
    const addItem = useBagStore((state) => state.addItem)
    const removeItem = useBagStore((state) => state.removeItem)
    const isInBag = useBagStore((state) =>
        place ? state.isInBag(place.id) : false // place가 있으면 state.isInBag(place.id) 실행해서 결과 가져오고 없으면 false 가져옴
    )

    // 아무것도 선택 안 된 상태 - 조기 반환
    if (!place) { // place 가 null 또는 falsy 이면 안내 메시지 보이게 하고 함수 끝냄
        return (
            <div className="border rounded-card p-6 h-full flex items-center justify-center text-gray-400 text-sm">
                여행지를 선택하면 상세 정보가 여기에 표시됩니다.
            </div>
        )
    }

    const handleToggleBag = () => { // 담기 빼기 처리하는 토글 패턴
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

            {/* place.price 가 있을 때만 p태그 표시 */}
            {place.price && (
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