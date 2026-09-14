import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore";

interface PlaceCardProps{
    place: Place
}

export default function PlaceCard({ place }: PlaceCardProps) {
    const addItem = useBagStore((state) => state.addItem)
    const removeItem = useBagStore((state) => state.removeItem)
    const isInBag = useBagStore((state) => state.isInBag(place.id))

    // 우선 버튼 토글 방식 -> 이미 담겨있을 경우 빼고, 담겨있지 않을 경우 담는 액션
    const handleToggleBag = () => {
    if (isInBag) {
      removeItem(place.id)
    } else {
      addItem(place)
    }
  }

  return(
    <div>
        <div>
            <p>{place.name}</p>
            <p>{place.address}</p>
            {place.price !== null && (
                <p>{place.price.toLocaleString()}원</p>
            )}
        </div>

        <button
        onClick={handleToggleBag}>
            {isInBag ? '담김' : '담기'}
        </button>
    </div>
  )


}



