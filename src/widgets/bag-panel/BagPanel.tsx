import { useBagStore } from "../../entities/bag/model/useBagStore";
import { useDispatch } from "react-redux";
import { removeVisitsByPlaceId } from "../../entities/travel/model/visitSlice";

export default function BagPanel() {
  const items = useBagStore((state) => state.items)
  const removeItem = useBagStore((state) => state.removeItem)
  const dispatch = useDispatch()

  // 여행가방에서 장소를 뺄 때, 그 장소로 만들어둔 일정(visit)도 같이 지움.
  // 안 그러면 사라진 장소를 가리키는 유령 일정이 남아서 예산 합산에는 계속 잡히고,
  // 화면엔 안 보이는데 번호만 밀리는 버그가 생김
  const handleRemove = (placeId: number) => {
    removeItem(placeId)
    dispatch(removeVisitsByPlaceId(placeId))
  }

  return (
    <div>
      <h2 className="text-deep-ink font-bold mb-3">
        여행가방 <span className="text-cool-ash font-normal">{items.length}곳</span>
      </h2>

      {items.length === 0 && (
        <p className="text-sm text-cool-ash">담긴 여행지가 없어요</p>
      )}

      <div>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-start gap-3 py-2 border-b border-pebble">
            <div className="w-5 h-5 rounded-full bg-deep-ink text-pure-white text-xs flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </div>

            <div className="flex-1 flex items-start justify-between">
              <div>
                <p className="font-semibold text-deep-ink">{item.name}</p>
                <p className="text-xs text-cool-ash">
                  {item.category} · {item.price ? `${item.price.toLocaleString()}원` : '가격 미정'}
                </p>
              </div>
              <button onClick={() => handleRemove(item.id)} className="text-cool-ash">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}