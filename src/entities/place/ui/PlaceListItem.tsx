import type { Place } from "../model/types";

interface PlaceListItemProps {
    place: Place
    isSelected: boolean
    onClick: () => void
}

export default function PlaceListItem({ place, isSelected, onClick }: PlaceListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border rounded-card p-3 transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
      }`}
    >
      <p className="font-semibold">{place.name}</p>
      <p className="text-sm text-gray-500">{place.address}</p>
    </button>
  )
}
