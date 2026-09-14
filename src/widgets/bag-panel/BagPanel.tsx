import { useBagStore } from "../../entities/bag/model/useBagStore";

export default function BagPanel() {
    const items = useBagStore((state) => state.items) // 구독
    const removeItem = useBagStore((state) => state.removeItem) // removeItem 함수 정의

    return (
    <div>
      <h2>여행가방 ({items.length})</h2>

      {/* 담긴 게 없을 때 안내 문구 */}
      {items.length === 0 && (
        <p>담긴 여행지가 없어요</p>
      )}

      <div>
        {items.map((item) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <button
              onClick={() => removeItem(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}