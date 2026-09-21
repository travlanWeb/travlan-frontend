import { useBagStore } from "../../entities/bag/model/useBagStore";

export default function BagPanel() {
  const items = useBagStore((state) => state.items)
  const removeItem = useBagStore((state) => state.removeItem)

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
              <button onClick={() => removeItem(item.id)} className="text-cool-ash">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}