import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore";
import { useDispatch } from 'react-redux'
import { removeVisitsByPlaceId } from "../../travel/model/visitSlice";
import { Check } from 'lucide-react'

interface PlaceListItemProps {
  place: Place
  isSelected: boolean
  onClick: () => void
  onDetailClick: () => void // "상세보기" 버튼 전용 - 카드 선택(onClick)과는 별개로 모달을 염
  onHover?: () => void
  onHoverEnd?: () => void
}

export default function PlaceListItem({ place, isSelected, onClick, onDetailClick, onHover, onHoverEnd }: PlaceListItemProps) {
  const bagItems = useBagStore((state) => state.items)
  const isInBag = bagItems.some((item) => item.id === place.id)

  const addItem = useBagStore((state) => state.addItem)
  const removeItem = useBagStore((state) => state.removeItem)
  const dispatch = useDispatch()

  // 여행가방에서 뺄 때, 그 장소로 만들어져 있던 타임라인 visit도 같이 지움
  // (안 지우면 BagPanel에서 겪었던 것과 똑같이 금액/번호가 유령 데이터로 남음)
  const handleRemoveFromBag = () => {
    removeItem(place.id)
    dispatch(removeVisitsByPlaceId(place.id))
  }

  return (
    // 에어비앤비 스타일 - 테두리/그림자 없이 여백만으로 카드를 구분함
    // 선택된 카드만 은은한 배경(bg-paper)으로 표시 (border/shadow는 안 씀)
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      role="button"
      className={`text-left cursor-pointer rounded-flat p-2 transition-colors ${isSelected ? 'bg-paper' : ''}`}
    >
      {/* 이미지 - 정사각형 */}
      <div className="relative aspect-square rounded-flat overflow-hidden bg-pebble/20">
        {place.imgUrl ? (
          <img src={place.imgUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-cool-ash">사진 없음</div>
        )}

        {isInBag && (
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-deep-ink text-pure-white shadow-sm flex items-center justify-center">
            <Check size={14} />
          </div>
        )}
      </div>

      {/* 텍스트 정보 - 카드가 더 많이 보이도록 padding/gap을 좁게 잡음 */}
      <div className="pt-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-deep-ink truncate">{place.name}</p>
          <span className="text-sm text-cool-ash whitespace-nowrap shrink-0">
            {place.price ? `${place.price.toLocaleString()}원` : '가격 미정'}
          </span>
        </div>
        <p className="text-sm text-cool-ash mt-0.5 truncate">{place.category || '기타'}</p>

        {/* 담기 / 상세보기 */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation() // 버튼도 카드 안에 있어서 클릭 이벤트가 카드 onClick까지 전달됨 - 버블링 방지
              isInBag ? handleRemoveFromBag() : addItem(place)
            }}
            className={`flex-1 rounded-pill border border-pebble px-3 py-1 text-xs font-semibold transition-colors ${isInBag ? 'text-pure-white bg-deep-ink' : 'bg-pure-white text-deep-ink'
              }`}
          >
            {isInBag ? '담김' : '담기'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetailClick()
            }}
            className="flex-1 rounded-pill border border-pebble bg-pure-white text-deep-ink px-3 py-1 text-xs font-semibold"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  )
}
