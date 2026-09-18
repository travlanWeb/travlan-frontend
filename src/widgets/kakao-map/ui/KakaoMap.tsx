import { Map, CustomOverlayMap } from 'react-kakao-maps-sdk' // MapMarker 제거
import type { Place } from '../../../entities/place/model/types'
import { useBagStore } from '../../../entities/bag/model/useBagStore'
import { useMemo, useCallback, useRef, useEffect } from 'react'
import { Landmark, Bed, ShoppingBag, UtensilsCrossed, Coffee, MapPin } from 'lucide-react'
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
}

export default function KakaoMap({ places, onMarkerClick, onBoundsChange, showBagBadges = true, moveToPlace, selectedPlaceId }: KakaoMapProps) {
  const bagItems = useBagStore((state) => state.items)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  const center = useMemo(() => ({ lat: 35.8353, lng: 129.2107 }), [])

  const handleBoundsChange = useCallback((map: kakao.maps.Map) => {
    onBoundsChange?.(map.getBounds())
  }, [onBoundsChange])

  useEffect(() => {
    if (!moveToPlace || !mapRef.current) return
    const position = new kakao.maps.LatLng(moveToPlace.latitude, moveToPlace.longitude)
    mapRef.current.panTo(position)
  }, [moveToPlace])

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={8}
      onCreate={(map) => { mapRef.current = map }}
      onBoundsChanged={handleBoundsChange}
    >
      {places.map((place) => {
        const bagIndex = showBagBadges ? bagItems.findIndex((item) => item.id === place.id) : -1
        const isInBag = bagIndex !== -1
        const isSelected = place.id === selectedPlaceId // 추가

        if (isInBag) {
          return (
            <CustomOverlayMap key={place.id} 
            position={{ lat: place.latitude, lng: place.longitude }}
            zIndex={isSelected ? 100 : 10}>
              <div
                onClick={() => onMarkerClick?.(place)}
                className={`rounded-full bg-deep-ink text-white text-xs flex items-center justify-center cursor-pointer transition-all ${
                  isSelected ? 'w-8 h-8 ring-4 ring-clay-ember' : 'w-6 h-6'
                }`}
              >
                {bagIndex + 1}
              </div>
            </CustomOverlayMap>
          )
        }

        const markerColor = CATEGORY_COLORS[place.category] ?? DEFAULT_MARKER_COLOR
        const IconComponent = CATEGORY_ICONS[place.category] ?? MapPin

        return (
          <CustomOverlayMap key={place.id} 
          position={{ lat: place.latitude, lng: place.longitude }}
          zIndex={isSelected ? 100 : 1} >
            <div
              onClick={() => onMarkerClick?.(place)}
              className={`rounded-full flex items-center justify-center cursor-pointer shadow-sm border-2 border-pure-white transition-all ${
                isSelected ? 'w-11 h-11 ring-4 ring-clay-black' : 'w-8 h-8'
              }`}
              style={{ backgroundColor: markerColor }}
            >
              <IconComponent size={isSelected ? 20 : 16} color="white" />
            </div>
          </CustomOverlayMap>
        )
      })}
    </Map>
  )
}