import { useState } from "react"

export default function MyPage() {

  const [activeTab, setActiveTab] = useState<'created' | 'liked'>('created')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      {/* 내가 만든 여행 */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button
        onClick={() => setActiveTab('created')}
        className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
          activeTab === 'created'
          ? 'border-deep-ink text-deep-ink'
          : 'border-transparent text-gray-400'
        }`}
        >
          내가 만든 여행
        </button>


        {/* 찜한 여행 */}
        <button
        onClick={() => setActiveTab('liked')}
        className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
          activeTab === 'liked'
          ? 'border-deep-ink text-deep-ink'
          : 'border-transparent text-gray-400'
        }`}
        >
          찜한 여행
        </button>
      </div>

      
      {/* 값이 없을 경우 기본 상태 메시지 내보내기 */}
      <div className="text-gray-400 text-sm py-20 text-center">
        {activeTab === 'created' ? '아직 내가 만든 여행이 없어요' : '아직 찜한 여행이 없어요'}
      </div>
    </div>
  )
}