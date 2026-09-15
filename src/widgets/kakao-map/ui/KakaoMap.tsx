import { Map, MapMarker } from 'react-kakao-maps-sdk'
import type { Place } from '../../../entities/place/model/types'

interface KakaoMapProps {
  places: Place[]
  // 핀 클릭 시 실행할 함수 - 어떤 장소가 클릭됐는지 부모에게 알려줌
  // 이전에 만든 PlaceListItem의 onClick 패턴과 동일함 - 이 컴포넌트는 "핀이 클릭됐다"는 사실만 전달하고, 그걸로 뭘 할지는 부모(MainPage)가 결정
  onMarkerClick?: (place: Place) => void
}

function KakaoMap({ places, onMarkerClick }: KakaoMapProps) {
  // 지도 초기 중심 좌표 - 장소가 하나 이상 있으면 첫 번째 장소를 기준으로,
  // 없으면 서울 시청 근처를 기본값으로 (임시 fallback)
  const center = places.length > 0
    ? { lat: places[0].latitude, lng: places[0].longitude }
    : { lat: 37.5665, lng: 126.9780 }

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={8} // 확대/축소 정도 - 숫자가 클수록 더 넓은 범위가 보임
    >
      {places.map((place) => (
        <MapMarker
          key={place.id}
          position={{ lat: place.latitude, lng: place.longitude }}
          onClick={() => onMarkerClick?.(place)}
          // onMarkerClick이 undefined일 수도 있어서 옵셔널 체이닝(?.) 사용
          // - 이전에 PlaceDetail에서 배운 것과 같은 이유로 안전하게 호출
        />
      ))}
    </Map>
  )
}

export default KakaoMap