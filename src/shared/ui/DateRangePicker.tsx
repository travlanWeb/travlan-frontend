import { useState } from 'react'
import { getTodayString, getDateAfterDays, getThisWeekend } from '../lib/dateHelpers'

interface DateRangePickerProps {
    startDate: string
    endDate: string
    onChange: (start: string, end: string) => void
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleQuickSelect = (start: string, end: string) => {
        onChange(start, end)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="border border-pebble rounded-input px-4 py-2 text-sm text-left outline-none focus:border-deep-ink"
            >
                {startDate && endDate ? `${startDate} ~ ${endDate}` : '날짜 선택'}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-pure-white border border-pebble rounded-flat p-4 shadow-lg z-50 w-96">
                    <div className="flex flex-col gap-3 mb-4">
                        <button
                            onClick={() => {
                                const today = getTodayString()
                                handleQuickSelect(today, today)
                            }}
                            className="border border-pebble rounded-input px-4 py-3 text-left hover:bg-pebble/10 transition-colors"
                        >
                            <div className="font-semibold text-base text-deep-ink">오늘</div>
                            <div className="text-sm text-cool-ash mt-0.5">{getTodayString()}</div>
                        </button>

                        <button
                            onClick={() => {
                                const tomorrow = getDateAfterDays(1)
                                handleQuickSelect(tomorrow, tomorrow)
                            }}
                            className="border border-pebble rounded-input px-4 py-3 text-left hover:bg-pebble/10 transition-colors"
                        >
                            <div className="font-semibold text-base text-deep-ink">내일</div>
                            <div className="text-sm text-cool-ash mt-0.5">{getDateAfterDays(1)}</div>
                        </button>

                        <button
                            onClick={() => {
                                const [sat, sun] = getThisWeekend()
                                handleQuickSelect(sat, sun)
                            }}
                            className="border border-pebble rounded-input px-4 py-3 text-left hover:bg-pebble/10 transition-colors"
                        >
                            <div className="font-semibold text-base text-deep-ink">이번 주말</div>
                            <div className="text-sm text-cool-ash mt-0.5">{getThisWeekend().join(' ~ ')}</div>
                        </button>
                    </div>

                    <div className="border-t border-pebble pt-4 mt-1">
                        <p className="text-xs text-cool-ash uppercase tracking-wide mb-3">직접 선택</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    const newStart = e.target.value
                                    onChange(newStart, endDate && endDate >= newStart ? endDate : newStart)
                                }}
                                className="border border-pebble rounded-input px-3 py-2 text-sm outline-none focus:border-deep-ink flex-1"
                            />
                            <span className="text-cool-ash">~</span>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => {
                                    const newEnd = e.target.value
                                    // 시작 날짜가 없는 상태에서 종료 날짜만 먼저 고르면
                                    // 시작 날짜도 같이 채워서, "종료일만 있고 시작일 없는" 불완전한 상태를 방지
                                    onChange(startDate || newEnd, newEnd)
                                }}
                                className="border border-pebble rounded-input px-3 py-2 text-sm outline-none focus:border-deep-ink flex-1"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full rounded-pill bg-deep-ink text-pure-white py-2.5 text-sm font-semibold mt-5"
                    >
                        확인
                    </button>
                </div>
            )}
        </div>
    )
}