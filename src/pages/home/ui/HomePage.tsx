import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { useNavigate } from 'react-router-dom'

const features = [
  { title: '지도에서 필터링', desc: '원하는 조건으로 여행지를 검색하고 골라보세요.' },
  { title: '여행가방에 담기', desc: '마음에 드는 여행지를 여행가방에 모아두세요.' },
  { title: '타임라인으로 정리', desc: '담아둔 여행지를 날짜별 일정으로 배치하세요.' },
  { title: '커뮤니티에서 공유', desc: '완성한 여행 일정을 다른 사람들과 나눠보세요.' },
]

function HomePage() {

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const name = useSelector((state: RootState) => state.auth.name)
  const navigate = useNavigate()

  return (
    <div className="w-full">
      {/* ===== 1. 히어로 섹션 ===== */}
      <section className="w-full bg-pure-white px-10 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-[60px] font-bold text-deep-ink leading-tight">
          {isLoggedIn ? (
            <>{name}님, 어디로 떠나볼까요?</>
          ) : (
            <>예산 안에서, 완벽한 여행.</>
          )}
        </h1>
        <p className="text-[18px] text-cool-ash">
          지도에서 여행지를 고르고, 여행가방에 담아 타임라인으로 완성하세요.
        </p>

        <svg width="700" height="200" viewBox="0 0 700 200" className="my-2 max-w-full h-auto">
          {/* 도로 몸체 - 더 굵게 */}
          <path
            d="M35 175 Q 175 35, 350 105 T 665 55"
            stroke="#d5d3d4"
            strokeWidth="32"
            fill="none"
            strokeLinecap="round"
          />

          {/* 중앙 차선 - 흰 점선 */}
          <path
            d="M35 175 Q 175 35, 350 105 T 665 55"
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
            strokeDasharray="16 16"
          />

          {/* 자동차 실루엣 */}
          {/* 자동차 실루엣 - clay-ember 색상 */}
          <g>
            {/* 그림자 */}
            <ellipse cx="0" cy="10" rx="26" ry="3" fill="#000d10" opacity="0.15" />

            {/* 차체 - 주황색, 토큰 값을 그대로 참조해서 색상 바뀌면 자동 반영되게 함 */}
            <path
              d="M-24 -10 L-17 -10 L-12 -18 L12 -18 L17 -10 L24 -10 L24 4 L-24 4 Z"
              fill="var(--color-clay-ember)"
            />

            {/* 창문 - 살짝 어두운 톤으로 구분 */}
            <path
              d="M-14 -10 L-10 -16 L10 -16 L14 -10 Z"
              fill="#000d10"
              opacity="0.25"
            />

            {/* 바퀴 - 검정 + 안쪽 살짝 밝은 원 */}
            <circle cx="-12" cy="7" r="5.5" fill="#000d10" />
            <circle cx="-12" cy="7" r="2" fill="#8e8e95" />
            <circle cx="12" cy="7" r="5.5" fill="#000d10" />
            <circle cx="12" cy="7" r="2" fill="#8e8e95" />

            <animateMotion
              dur="6.9s"
              repeatCount="indefinite"
              path="M35 175 Q 175 35, 350 105 T 665 55"
              rotate="auto"
            />
          </g>
        </svg>

        <button
          type="button"
          onClick={() => navigate('/travels/new/map')}
          className="rounded-pill bg-deep-ink text-pure-white px-8 py-3 text-[18px] font-semibold"
        >
          여행 만들기
        </button>
      </section>

      {/* ===== 2. 서비스 소개 섹션 ===== */}
      <section className="w-full bg-pure-white px-10 py-20">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[37px] font-bold text-deep-ink mb-12">
            여행가방부터 타임라인까지
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="border-t border-pebble pt-4">
                <h3 className="text-[23px] font-bold text-deep-ink mb-2">{f.title}</h3>
                <p className="text-[18px] text-cool-ash">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. 강조 섹션 ===== */}
      <section className="w-full bg-clay-ember px-10 py-16 text-deep-ink text-center">
        <h2 className="text-[37px] font-bold mb-4">예산 관리, 이렇게 쉬워집니다</h2>
        <p className="text-[18px]">
          여행지마다 가격을 확인하고, 여행가방 안에서 예산을 한눈에 관리하세요.
        </p>
      </section>

      {/* ===== 4. 다크 섹션 ===== */}
      <section className="w-full bg-midnight-hull px-10 py-20 flex justify-end">
        <div className="max-w-[500px] text-right text-pure-white">
          <p className="text-[23px] font-bold mb-3">
            커뮤니티에서 다른 여행자의 일정을 둘러보세요
          </p>
          <p className="text-[18px] text-cool-ash">
            다른 사람들이 만든 타임라인을 참고하고, 나만의 여행을 완성해보세요.
          </p>
        </div>
      </section>

      {/* ===== 5. 푸터 ===== */}
      <footer className="w-full bg-deep-ink px-10 py-12 text-pure-white">
        <p className="text-[60px] font-bold mb-6">TRAVLAN</p>
        <div className="flex gap-6 text-sm text-cool-ash">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>고객센터</span>
        </div>
      </footer>
    </div>
  )
}

export default HomePage