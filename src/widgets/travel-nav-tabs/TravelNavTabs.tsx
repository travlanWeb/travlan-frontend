import { useNavigate, useParams, useLocation } from 'react-router-dom'

interface TravelNavTabsProps {
    disableTimeline?: boolean // 타임라인 탭 비활성화 기능을 위한 props
}

export default function TravelNavTabs({ disableTimeline }: TravelNavTabsProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { travelId } = useParams()

    const isMapPage = location.pathname.includes('/map')

    return (
        <div className="flex gap-2">
            <button
                onClick={() => navigate(`/travels/${travelId}/map`)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-pill border ${isMapPage
                        ? 'bg-deep-ink text-pure-white border-deep-ink'
                        : 'border-pebble text-cool-ash'
                    }`}
            >
                지도
            </button>
            <button
                onClick={() => !disableTimeline && navigate(`/timeline/${travelId}`)}
                disabled={disableTimeline}
                className={`px-4 py-1.5 text-sm font-semibold rounded-pill border transition-colors ${disableTimeline
                        ? 'border-pebble text-cool-ash/50 bg-pebble/10 cursor-not-allowed'
                        : !isMapPage
                            ? 'bg-deep-ink text-pure-white border-deep-ink'
                            : 'border-pebble text-cool-ash'
                    }`}
            >
                타임라인
            </button>
        </div>
    )
}