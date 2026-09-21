import { Image } from 'lucide-react'

interface TravelCardBaseProps {
    name: string
    startDate: string
    endDate: string
    totalBudget: number
    statusBadge?: string // "임시저장" 같은 뱃지, 없으면 안 보임
    authorName?: string // 작성자 이름, 있으면 하단에 표시
    authorProfileImage?: string
    onClick?: () => void
    footer?: React.ReactNode // 수정/삭제 버튼 등, 페이지마다 다른 하단 영역
    imageUrl?: string | null
}

export default function TravelCardBase({
    name,
    startDate,
    endDate,
    totalBudget,
    statusBadge,
    authorName,
    authorProfileImage,
    imageUrl,
    onClick,
    footer,
}: TravelCardBaseProps) {
    return (
        // 그림자 대신 헤어라인 테두리(border-pebble)로 카드 층위를 표현함
        // 클릭되는 카드(onClick 있음)만 hover 시 테두리 색이 진해지도록 hover:border-mist 추가
        <div
            onClick={onClick}
            className={`overflow-hidden bg-pure-white border border-pebble rounded-flat ${onClick ? 'cursor-pointer hover:border-mist transition-colors duration-150' : ''}`}
        >
            {/* 카드 상단 이미지 - 여행/풍경 사진에 어울리는 가로로 넓은 비율(16:9)로 꽉 채움.
                카드 자체에 overflow-hidden이 있어서 이미지 쪽엔 별도 radius가 필요 없음 */}
            <div className="aspect-video flex items-center justify-center bg-paper">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <Image className="w-8 h-8 text-cool-ash opacity-70" strokeWidth={1.5} />
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-deep-ink">{name}</h3>
                    {statusBadge && (
                        <span className="text-xs text-graphite border border-pebble rounded-badge px-2 py-0.5">
                            {statusBadge}
                        </span>
                    )}
                </div>

                <p className="text-sm text-cool-ash mb-3">
                    {startDate} ~ {endDate} · {totalBudget.toLocaleString()}원
                </p>

                {authorName && (
                    <div className="flex items-center gap-2 pt-3 border-t border-mist mb-3">
                        <div className="w-6 h-6 rounded-full bg-pebble/30 overflow-hidden flex items-center justify-center text-[10px] text-cool-ash shrink-0">
                            {authorProfileImage ? (
                                <img src={authorProfileImage} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                                '👤'
                            )}
                        </div>
                        <span className="text-xs text-cool-ash">{authorName}</span>
                    </div>
                )}

                {footer}
            </div>
        </div>
    )
}