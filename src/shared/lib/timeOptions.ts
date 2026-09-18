// 00:00부터 23:30까지 30분 단위 시간 목록 생성 ("00:00", "00:30", "01:00", ...)
export function generateTimeOptions(): string[] {
    const options: string[] = []
    for (let hour = 0; hour < 24; hour++) {
        for (const minute of [0, 30]) {
            const h = String(hour).padStart(2, '0')
            const m = String(minute).padStart(2, '0')
            options.push(`${h}:${m}`)
        }
    }
    return options
}

// 시작 시간 + 소요시간(분)을 더해서 종료 시간 문자열 계산 ("14:00" + 120분 → "16:00")
// 자정을 넘어가면 다시 00:00부터 순환 (24시간 안에서 처리)
export function addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = (h * 60 + m + minutes) % (24 * 60)
    const newH = Math.floor(totalMinutes / 60)
    const newM = totalMinutes % 60
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}