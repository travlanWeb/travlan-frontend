import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore"; // 담긴 순서 알기 위해서 import]


interface PlaceListItemProps {
  place: Place
  isSelected: boolean
  onClick: () => void // 함수 모양만 정의하고 실제 동작은 부모가 채워넣는다
}

export default function PlaceListItem({ place, isSelected, onClick }: PlaceListItemProps) {
  // zustand 라서 부모(mainPage)가 몇 번째로 담겼는지 계산해서 넘겨주지 않아도 컴포넌트가 스스로 정보 가져다 씀
  const bagItems = useBagStore((state) => state.items)
  const bagIndex = bagItems.findIndex((item) => item.id === place.id) // 몇 번째에 있는지 index 반환
  const isInBag = bagIndex !== -1 // 가방 안에 있는지 없는지 확인

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border rounded-card p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
        }`}
    >
      <div
        className={`w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs ${isInBag ? 'bg-deep-ink text-pure-white border-deep-ink' : 'bg-pure-white'
          }`}
      >
        {isInBag && (bagIndex + 1)}
      </div>
      <p className="font-semibold">{place.name}</p>
      <p className="text-sm text-gray-500">{place.address}</p>
      <p className="text-sm text-cool-ash">
        {place.price !== null ? `${place.price.toLocaleString()}원` : '가격 미정'}
      </p>
    </button>
  )
}
