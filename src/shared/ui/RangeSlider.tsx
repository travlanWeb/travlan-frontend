interface RangeSliderProps {
    min: number
    max: number
    step: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    formatLabel?: (value: number) => string //값 화면 표시
}


export default function RangeSlider({ min, max, step, value, onChange, formatLabel }: RangeSliderProps) {

    const [low, high] = value
    const display = formatLabel ?? ((v: number) => v.toLocaleString())

    return (
        <div>
            <p className="text-sm text-cool-ash mb-2">
                {display(low)} ~ {display(high)}
            </p>
            <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-1 bg-pebble rounded-pill" />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={low}
                    onChange={(e) => onChange([Math.min(Number(e.target.value), high), high])}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-deep-ink"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={high}
                    onChange={(e) => onChange([low, Math.max(Number(e.target.value), low)])}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-deep-ink"
                />
            </div>
        </div>
    )
}
