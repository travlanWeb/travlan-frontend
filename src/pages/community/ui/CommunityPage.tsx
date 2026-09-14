// 커뮤니티 페이지 기본 뼈대
// 9/14 - 페이지 구조(제목 + 목록) 잡아두기

export default function CommunityPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-16">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
        <p className="text-gray-500">다른 여행자들의 여행을 둘러보고 마음에 드는 여행을 저장하세요!</p>
      </div>

      {/* 실 데이터와 연동 필요함 - 현재 임시 데이터 */}
      <div className="text-gray-400 text-sm py-20 text-center">
        게시글 목록 준비 중...
      </div>
    </div>
  )
}