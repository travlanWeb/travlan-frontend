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
}

export default function TravelCardBase({
    name,
    startDate,
    endDate,
    totalBudget,
    statusBadge,
    authorName,
    authorProfileImage,
    onClick,
    footer,
}: TravelCardBaseProps) {
    return (
        <div
            onClick={onClick}
            className={`border border-pebble rounded-flat overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="h-32 bg-pebble/20 flex items-center justify-center text-xs text-cool-ash">
                대표 사진
            </div>

            <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-deep-ink">{name}</h3>
                    {statusBadge && (
                        <span className="text-xs text-cool-ash border border-pebble rounded-pill px-2 py-0.5">
                            {statusBadge}
                        </span>
                    )}
                </div>

                <p className="text-sm text-cool-ash mb-3">
                    {startDate} ~ {endDate} · {totalBudget.toLocaleString()}원
                </p>

                {authorName && (
                    <div className="flex items-center gap-2 pt-3 border-t border-pebble mb-3">
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