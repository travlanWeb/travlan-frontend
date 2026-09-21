import type { Place } from "../model/types";
import { useBagStore } from "../../bag/model/useBagStore";
import { useState } from "react";

interface PlaceDetailProps {
    place: Place | null // 유니온 타입 -> 선택된 장소, 아무것도 선택 안 됐으면 null
    onClose?: () => void // 닫기 버튼 기능 생성
}

export default function PlaceDetail({ place, onClose }: PlaceDetailProps) {

    // zustand 에서 값 꺼내오기
    const addItem = useBagStore((state) => state.addItem)
    const removeItem = useBagStore((state) => state.removeItem)
    const isInBag = useBagStore((state) =>
        place ? state.isInBag(place.id) : false // place가 있으면 state.isInBag(place.id) 실행해서 결과 가져오고 없으면 false 가져옴
    )

    // 설명이 너무 긴 경우를 고려해서 '더보기'로 펼쳐보기
    const [isExpanded, setIsExpanded] = useState(false)


    // 아무것도 선택 안 된 상태 - 조기 반환 (조기 반환은 무조건 모든 훅 호출이 끝난 후에 와야 함, 훅 개수로 인해 오류가 생길 수 있음!)
    // ai 정리: 컴포넌트 함수 안에서, 모든 useState/useEffect/커스텀 훅 호출이 다 끝난 다음에만 써야 한다
    if (!place) return null


    const handleToggleBag = () => { // 담기 빼기 처리하는 토글 패턴
        if (isInBag) {
            removeItem(place.id)
        } else {
            addItem(place)
        }
    }

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="relative">
                {place.imgUrl && (
                    <img
                        src={place.imgUrl}
                        alt={place.name}
                        className="w-full h-56 object-cover rounded-flat"
                    />
                )}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pure-white border border-pebble flex items-center justify-center text-deep-ink"
                >✕</button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-deep-ink">{place.name}</h3>
                    {place.price && (
                        <span className="text-base text-cool-ash whitespace-nowrap ml-2">
                            {place.price.toLocaleString()}원
                        </span>
                    )}
                </div>

                {place.overview && (
                    <div className="mb-4">
                        <p className={`text-sm text-cool-ash ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {place.overview}
                        </p>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-deep-ink font-semibold mt-1"
                        >
                            {isExpanded ? '접기' : '더보기'}
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={handleToggleBag}
                className={`w-full rounded-pill py-2.5 text-sm font-semibold transition-colors shrink-0 ${isInBag
                    ? 'bg-deep-ink text-pure-white'
                    : 'border border-pebble text-deep-ink'
                    }`}
            >
                {isInBag ? '담김 ✓' : '여행가방에 담기'}
            </button>
        </div>
    )
}