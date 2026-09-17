import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore"; // 담긴 순서 알기 위해서 import

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


  const addItem = useBagStore((state) => state.addItem)
  const removeItem = useBagStore((state) => state.removeItem)

  return (
    <div
      onClick={onClick}
      role="button"
      className={`w-full text-left border rounded-flat p-3 flex flex-col gap-2 transition-colors ${
        isSelected ? 'border-deep-ink bg-pebble/20' : 'border-pebble'
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isInBag && (
          <div className="w-5 h-5 rounded-full bg-deep-ink text-pure-white text-xs flex items-center justify-center shrink-0">
            {bagIndex + 1}
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-semibold text-deep-ink">{place.name}</p>
          <p className="text-sm text-cool-ash">{place.address}</p>
          <p className="text-sm text-cool-ash">
            {place.price ? `${place.price.toLocaleString()}원` : '가격 미정'}
          </p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation() // 담기 버튼도 div 안에 있어서 클릭 이벤트가 부모 div 에 전달됨, 이벤트 버블링 발생 방지 코드
          isInBag ? removeItem(place.id) : addItem(place)
        }}
        className={`self-start rounded-pill border border-pebble px-4 py-1 text-xs transition-colors ${isInBag ? 'text-pure-white bg-deep-ink' : 'bg-pure-white'}`}
      >
        {isInBag ? '담김' : '담기'}
      </button>
    </div>
  )
}
