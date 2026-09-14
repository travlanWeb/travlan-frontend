import { useNavigate } from 'react-router-dom'
import Navbar from '../../../widgets/navbar/ui/Navbar'

// 서비스 소개 섹션 내용
const features = [
  { title: '지도에서 필터링', desc: '원하는 조건으로 여행지를 검색하고 골라보세요.' },
  { title: '여행가방에 담기', desc: '마음에 드는 여행지를 여행가방에 모아두세요.' },
  { title: '타임라인으로 정리', desc: '담아둔 여행지를 날짜별 일정으로 배치하세요.' },
  { title: '커뮤니티에서 공유', desc: '완성한 여행 일정을 다른 사람들과 나눠보세요.' },
]

export default function HomePage() {
    const navigate = useNavigate()

    // TODO: 여행 생성 API 연동 후 실제 생성된 travelId로 교체 필요
    // 백엔드 연동 전이라 하드코딩
    const TEMP_TRAVEL_ID = '1'

    // 지도로 이동
    const handleNavigateMap = () => {
        navigate(`/travels/${TEMP_TRAVEL_ID}/map`)
    }

    // 여행 만들기
    const handleCreateTravel = () => {
        console.log('여행 만들기 클릭됨')
    }

    return (
        <div>
            <Navbar
            alwaysOpaque={false}
            onNavigateMap={handleNavigateMap}
            onCreateTravel={handleCreateTravel}
            />
            {/* ===== 1. 히어로 섹션 ===== */}
      <section className="w-full bg-pure-white px-10 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-[60px] font-bold text-deep-ink leading-tight">
          예산 안에서, 완벽한 여행.
        </h1>
        <p className="text-[18px] text-cool-ash">
          지도에서 여행지를 고르고, 여행가방에 담아 타임라인으로 완성하세요.
        </p>

        {/* 장식용 SVG: 실제 지도 데이터가 아니라 "경로선" 느낌만 주는 일러스트
            path의 d 속성: 곡선을 그리는 좌표 명령어 (Q는 2차 베지어 곡선, T는 이어지는 곡선) */}
        <svg width="400" height="120" viewBox="0 0 400 120" className="my-2">
          <path
            d="M20 100 Q 100 20, 200 60 T 380 30"
            stroke="#bc7155"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 6"
          />
          <circle cx="20" cy="100" r="5" fill="#000d10" />
          <circle cx="200" cy="60" r="5" fill="#000d10" />
          <circle cx="380" cy="30" r="5" fill="#bc7155" />
        </svg>

        <button
          type="button"
          onClick={handleCreateTravel}
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

      {/* ===== 3. 강조 섹션 (유일하게 색이 들어가는 곳) ===== */}
      <section className="w-full bg-clay-ember px-10 py-16 text-pure-white text-center">
        <h2 className="text-[37px] font-bold mb-4">예산 관리, 이렇게 쉬워집니다</h2>
        <p className="text-[18px]">
          여행지마다 가격을 확인하고, 여행가방 안에서 예산을 한눈에 관리하세요.
        </p>
      </section>

      {/* ===== 4. 다크 섹션 (커뮤니티 소개) ===== */}
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