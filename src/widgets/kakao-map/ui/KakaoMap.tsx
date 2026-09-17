import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import type { Place } from '../../../entities/place/model/types'
import { useBagStore } from '../../../entities/bag/model/useBagStore'
import { useMemo, useCallback, useRef } from 'react'

// customOverlayMap: 기본 핀 모양이 아닌 커스텀 html 그대로 얹을 수 있게 한 컴포넌트

interface KakaoMapProps {
  places: Place[]
  // 핀 클릭 시 실행할 함수 - 어떤 장소가 클릭됐는지 부모에게 알려줌
  // 이전에 만든 PlaceListItem의 onClick 패턴과 동일함 - 이 컴포넌트는 "핀이 클릭됐다"는 사실만 전달하고, 그걸로 뭘 할지는 부모(MainPage)가 결정
  onMarkerClick?: (place: Place) => void
  onBoundsChange?: (bounds: kakao.maps.LatLngBounds) => void // 지도 안에 있는 데이터만 리스트로 빼기 위한 기능
}

// (9/17 추가) 지도에 나와있는 핀만 리스트에 전달

export default function KakaoMap({ places, onMarkerClick, onBoundsChange }: KakaoMapProps) {
  // 지도 초기 중심 좌표 - 장소가 하나 이상 있으면 첫 번째 장소를 기준으로,
  // 없으면 서울 시청 근처를 기본값으로 (임시 fallback)
  const bagItems = useBagStore((state) => state.items)

  // 초기 중심 설정했는지 확인하는 useRef
  const hasSetInitialCenter = useRef(false)

  const center = useMemo(() => { // useMemo: places[0]?.id 가 바뀌지 않는 한 객체를 새로 만들지 않고 재사용한다
    //  한 번 계산 후에는 다시 계산하는 거 없음
    if (hasSetInitialCenter.current) {
      return { lat: 37.5665, lng: 126.9780 }
    }

    if (places.length > 0) {
      hasSetInitialCenter.current = true // "이제 계산 끝났다" 표시
      return { lat: places[0].latitude, lng: places[0].longitude }
    }

    return { lat: 37.5665, lng: 126.9780 }
  }, [places.length > 0]) // "장소가 생겼는지 없는지"만 감지 (0 -> 양수로 바뀌는 순간)



  // (fix: Error) onBoundsChange가 바뀌지 않는 한 항상 같은 함수를 재사용
  const handleBoundsChange = useCallback((map: kakao.maps.Map) => {
    onBoundsChange?.(map.getBounds())
  }, [onBoundsChange])

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={8} // 확대/축소 정도 - 숫자가 클수록 더 넓은 범위가 보임
      onCreate={handleBoundsChange} // 지도 처음 만들어질 때
      onBoundsChanged={handleBoundsChange} // 이동이나 확대축소 끝났을 때
    >

      {places.map((place) => {
        const bagIndex = bagItems.findIndex((item) => item.id === place.id)
        const isInBag = bagIndex !== -1

        if (isInBag) {
          // 담겨있는 장소
          return (
            <CustomOverlayMap
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
            >
              <div
                onClick={() => onMarkerClick?.(place)}
                className="w-6 h-6 rounded-full bg-deep-ink text-white text-xs flex items-center justify-center cursor-pointer"
              >
                {bagIndex + 1}
              </div>
            </CustomOverlayMap>
          )
        }

        // 안 담겨있는 장소 -> 기본 마커로 표시하기
        return (
          <MapMarker
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            onClick={() => onMarkerClick?.(place)}
          />
        )
      })}
    </Map>
  )
}