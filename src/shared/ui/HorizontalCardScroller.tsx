import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HorizontalCardScrollerProps {
    title: string
    subtitle?: string
    onSeeAll?: () => void // "전체보기" 클릭 시 실행할 함수
    children: React.ReactNode // 카드들 자체
}

export default function HorizontalCardScroller({ title, subtitle, onSeeAll, children }: HorizontalCardScrollerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollByAmount = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = scrollRef.current.clientWidth * 0.9 // 화면 폭의 90%만큼씩 이동
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth', // 부드럽게 스크롤
        })
    }

    return (
        <div className="mb-16">
            <div className="flex items-center justify-between border-b border-pebble pb-3 mb-6">
                <h2 className="text-xl font-bold text-deep-ink">{title}</h2>
                <div className="flex items-center gap-4">
                    {subtitle && <span className="text-sm text-cool-ash">{subtitle}</span>}
                    {onSeeAll && (
                        <button onClick={onSeeAll} className="text-sm text-deep-ink font-semibold underline">
                            전체보기
                        </button>
                    )}
                </div>
            </div>

            <div className="relative">
                {/* 왼쪽 화살표 */}
                <button
                    onClick={() => scrollByAmount('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-pure-white border border-pebble flex items-center justify-center shadow-sm"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* 스크롤 컨테이너 */}
                <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden">
                    {children}
                </div>

                {/* 오른쪽 화살표 */}
                <button
                    onClick={() => scrollByAmount('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-pure-white border border-pebble flex items-center justify-center shadow-sm"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    )
}