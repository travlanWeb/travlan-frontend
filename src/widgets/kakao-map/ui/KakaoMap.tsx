import { Map, CustomOverlayMap } from 'react-kakao-maps-sdk' // MapMarker 제거
import type { Place } from '../../../entities/place/model/types'
import { useBagStore } from '../../../entities/bag/model/useBagStore'
import { useMemo, useCallback, useRef, useEffect } from 'react'
import { Landmark, Bed, ShoppingBag, UtensilsCrossed, Coffee, MapPin, Check, Plus, Minus } from 'lucide-react'
import { CATEGORY_COLORS, DEFAULT_MARKER_COLOR } from '../../../entities/place/model/categoryMap'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  '관광': Landmark,
  '숙박': Bed,
  '쇼핑': ShoppingBag,
  '음식점': UtensilsCrossed,
  '카페': Coffee,
}

interface KakaoMapProps {
  places: Place[]
  onMarkerClick?: (place: Place) => void
  onBoundsChange?: (bounds: kakao.maps.LatLngBounds) => void
  showBagBadges?: boolean
  moveToPlace?: Place | null
  selectedPlaceId?: number | null // id 마커 강조 (어느 마커 보고 있는지 (상세 정보 사용 시))
  hoveredPlaceId?: number | null // 카드 목록에서 마우스 올린 장소 - 선택 상태보다 약하게 강조
}

export default function KakaoMap({ places, onMarkerClick, onBoundsChange, showBagBadges = true, moveToPlace, selectedPlaceId, hoveredPlaceId }: KakaoMapProps) {
  const bagItems = useBagStore((state) => state.items)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const hasSetInitialBoundsRef = useRef(false) // 최초 bounds 세팅이 한 번만 일어나게 막는 가드

  const center = useMemo(() => ({ lat: 35.8353, lng: 129.2107 }), [])

  // 사용자가 실제로 드래그하거나 확대/축소했을 때만 목록을 다시 필터링하기 위한 핸들러.
  // bounds_changed는 panTo(장소 선택 시 프로그래밍적으로 지도 이동)에도 발생해서 쓰면 안 됨 -
  // dragend/zoom_changed는 카카오맵 SDK상 사용자가 직접 드래그하거나 확대/축소 컨트롤을 조작했을 때만 발생함
  const handleUserBoundsChange = useCallback((map: kakao.maps.Map) => {
    onBoundsChange?.(map.getBounds())
  }, [onBoundsChange])

  // onCreate는 렌더마다 새 함수를 만들면 안 됨 - Map 컴포넌트가 참조 변경을 감지해서
  // 다시 호출하면, 그 안에서 setState(onBoundsChange) -> 부모 리렌더 -> onCreate 재생성 -> 다시 호출...
  // 이렇게 무한 루프에 빠짐("Maximum update depth exceeded"). useCallback으로 참조를 고정하고,
  // ref 가드로 최초 1회만 bounds를 세팅하도록 이중으로 막음
  const handleMapCreate = useCallback((map: kakao.maps.Map) => {
    mapRef.current = map
    if (!hasSetInitialBoundsRef.current) {
      hasSetInitialBoundsRef.current = true
      onBoundsChange?.(map.getBounds())
    }
  }, [onBoundsChange])

  useEffect(() => {
    if (!moveToPlace || !mapRef.current) return
    const position = new kakao.maps.LatLng(moveToPlace.latitude, moveToPlace.longitude)
    mapRef.current.panTo(position)
  }, [moveToPlace])

  // 줌인/줌아웃 - 카카오맵은 level이 낮을수록 확대된 상태라 -1이 줌인, +1이 줌아웃
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return
    mapRef.current.setLevel(mapRef.current.getLevel() - 1)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return
    mapRef.current.setLevel(mapRef.current.getLevel() + 1)
  }, [])

  return (
    <div className="relative w-full h-full">
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={8}
        onCreate={handleMapCreate}
        onDragEnd={handleUserBoundsChange}
        onZoomChanged={handleUserBoundsChange}
      >
        {places.map((place) => {
          const bagIndex = showBagBadges ? bagItems.findIndex((item) => item.id === place.id) : -1
          const isInBag = bagIndex !== -1
          const isSelected = place.id === selectedPlaceId // 추가
          // 선택 상태가 우선이고, 선택 안 됐을 때만 호버 강조를 보여줌(둘이 동시에 겹쳐 보이지 않도록)
          const isHovered = !isSelected && place.id === hoveredPlaceId

          if (isInBag) {
            return (
              <CustomOverlayMap key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              zIndex={isSelected ? 100 : isHovered ? 50 : 10}>
                <div
                  onClick={() => onMarkerClick?.(place)}
                  className={`rounded-full bg-deep-ink text-white flex items-center justify-center cursor-pointer transition-all ${
                    isSelected ? 'w-8 h-8 ring-4 ring-clay-ember' : isHovered ? 'w-7 h-7 ring-4 ring-mist' : 'w-6 h-6'
                  }`}
                >
                  <Check size={14} />
                </div>
              </CustomOverlayMap>
            )
          }

          const markerColor = CATEGORY_COLORS[place.category] ?? DEFAULT_MARKER_COLOR
          const IconComponent = CATEGORY_ICONS[place.category] ?? MapPin

          return (
            <CustomOverlayMap key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            zIndex={isSelected ? 100 : isHovered ? 50 : 1} >
              <div
                onClick={() => onMarkerClick?.(place)}
                className={`rounded-full flex items-center justify-center cursor-pointer shadow-sm border-2 border-pure-white transition-all ${
                  isSelected ? 'w-11 h-11 ring-4 ring-deep-ink' : isHovered ? 'w-10 h-10 ring-4 ring-mist' : 'w-8 h-8'
                }`}
                style={{ backgroundColor: markerColor }}
              >
                <IconComponent size={isSelected ? 20 : isHovered ? 18 : 16} color="white" />
              </div>
            </CustomOverlayMap>
          )
        })}
      </Map>

      {/* 줌 컨트롤 - 카카오맵 기본 컨트롤 대신 커스텀 +/- 버튼 */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col rounded-pill border border-pebble bg-pure-white overflow-hidden">
        <button
          onClick={handleZoomIn}
          aria-label="지도 확대"
          className="w-10 h-10 flex items-center justify-center hover:bg-mist/30 transition-colors"
        >
          <Plus size={18} />
        </button>
        <div className="h-px bg-pebble" />
        <button
          onClick={handleZoomOut}
          aria-label="지도 축소"
          className="w-10 h-10 flex items-center justify-center hover:bg-mist/30 transition-colors"
        >
          <Minus size={18} />
        </button>
      </div>
    </div>
  )
}