// import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { api } from '../../../shared/api/axiosInstance'
import { useMyTravels } from '../../../entities/travel/model/useMyTravels'
import { TRAVEL_STATUS } from '../../../entities/travel/model/travelStatus'

export default function MyPage() {
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const name = useSelector((state: RootState) => state.auth.name)
  const myTravels = useMyTravels()

  // TODO: 한줄소개는 백엔드 필드 생기면 실제 값으로 교체 예정
  const bio = '여행을 계획하는 중'

  // 내가 만든 여행 = DRAFT + COMPLETED 전부 포함 (이미 /travels/mine 자체가 내 것만 주니까 상태 구분 없이 다 보여줌)
  // const draftCount = myTravels.filter((t) => t.status === TRAVEL_STATUS.DRAFT).length

  const handleEdit = (travelId: number) => {
    navigate(`/travels/${travelId}/map`) // 기존 지도 페이지 재사용해서 수정 흐름으로
  }

  const handleDelete = async (travelId: number) => {
    if (!confirm('이 여행을 삭제하시겠어요?')) return
    try {
      await api.delete(`/travels/${travelId}`)
      window.location.reload() // 간단하게 새로고침으로 목록 갱신
    } catch (error) {
      console.error('여행 삭제 실패', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-[1200px] mx-auto px-10 py-32 text-center">
        <p className="text-lg text-deep-ink font-semibold mb-4">로그인이 필요합니다</p>
        <button
          onClick={() => navigate('/login')}
          className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold"
        >
          로그인하러 가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-16">
      {/* 프로필 카드 */}
      <div className="border border-pebble rounded-flat p-8 flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-pebble/30 flex items-center justify-center text-xs text-cool-ash">
            프로필
          </div>
          <div>
            <h1 className="text-xl font-bold text-deep-ink mb-1">{name || '여행자'}</h1>
            <p className="text-sm text-cool-ash mb-3">{bio}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-lg font-bold text-deep-ink">{myTravels.length}</p>
                <p className="text-xs text-cool-ash">내 여행</p>
              </div>
              <div>
                <p className="text-lg font-bold text-deep-ink">-</p>
                <p className="text-xs text-cool-ash">찜한 여행</p>
              </div>
              <div>
                <p className="text-lg font-bold text-deep-ink">-</p>
                <p className="text-xs text-cool-ash">받은 좋아요</p>
              </div>
            </div>
          </div>
        </div>
        <button className="rounded-pill border border-pebble text-deep-ink px-5 py-2 text-sm font-semibold">
          정보 수정
        </button>
      </div>

      {/* 내가 만든 여행 */}
      <div className="mb-16">
        <div className="flex items-center justify-between border-b border-pebble pb-3 mb-6">
          <h2 className="text-xl font-bold text-deep-ink">내가 만든 여행</h2>
          <span className="text-sm text-cool-ash">카드를 눌러 수정하거나 삭제하세요</span>
        </div>

        {myTravels.length === 0 && (
          <p className="text-sm text-cool-ash">아직 만든 여행이 없어요.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myTravels.map((travel) => (
            <div key={travel.id} className="border border-pebble rounded-flat overflow-hidden">
              <div className="h-32 bg-pebble/20 flex items-center justify-center text-xs text-cool-ash">
                대표 사진
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-deep-ink">{travel.name}</h3>
                  {travel.status === TRAVEL_STATUS.DRAFT && (
                    <span className="text-xs text-cool-ash border border-pebble rounded-pill px-2 py-0.5">
                      임시저장
                    </span>
                  )}
                </div>
                <p className="text-sm text-cool-ash mb-3">
                  {travel.startDate} ~ {travel.endDate} · {travel.totalBudget.toLocaleString()}원
                </p>
                <div className="flex gap-2 border-t border-pebble pt-3">
                  <button
                    onClick={() => handleEdit(travel.id)}
                    className="rounded-pill border border-pebble text-deep-ink px-4 py-1.5 text-xs font-semibold"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(travel.id)}
                    className="rounded-pill border border-pebble text-cool-ash px-4 py-1.5 text-xs font-semibold"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 찜한 여행 - API 대기, 자리만 */}
      <div>
        <div className="flex items-center justify-between border-b border-pebble pb-3 mb-6">
          <h2 className="text-xl font-bold text-deep-ink">찜한 여행</h2>
        </div>
        <p className="text-sm text-cool-ash">찜하기 기능은 준비 중이에요.</p>
      </div>
    </div>
  )
}