// 오늘 날짜를 'YYYY-MM-DD' 형식 문자열로
export function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
}

// 오늘부터 n일 후의 날짜를 'YYYY-MM-DD' 형식으로
export function getDateAfterDays(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
}

// 이번 주말(가장 가까운 토요일, 일요일)을 [시작, 끝] 형태로
export function getThisWeekend(): [string, string] {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=일요일, 6=토요일
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysUntilSaturday)
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    return [saturday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]]
}