import { mockPlaces } from '../../entities/place/model/mockPlaces'
import PlaceCard from '../../entities/place/ui/PlaceCard'

function MainPage() {
  return (
    <div className="p-8 flex gap-8">
      {/* 지도 자리 - 실제 지도 라이브러리는 나중에 붙임. 지금은 자리만 차지 */}
      <div className="flex-1 bg-gray-100 rounded-card h-[500px] flex items-center justify-center text-gray-400">
        지도 영역 (준비 중)
      </div>

      {/* 장소 리스트 */}
      <div className="w-80 flex flex-col gap-3">
        <h2 className="font-semibold">여행지 목록</h2>
        {mockPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  )
}

export default MainPage