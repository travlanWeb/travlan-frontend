// widgets 레이어 -> 여러 페이지 상단에 공통으로 올라가는 네비게이션 조각, 기존 헤더와 별개
// 홈 화면에 우선 적용

// Navbar 클릭 시 새로고침 없이 화면 전환, 현재 경로와 일치 여부 알려주는 컴포넌트
// 기존 Header 가 쓰던 방식과 통합

import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux'
import { logout } from '../../../entities/auth/model/authSlice';
import type { RootState } from '../../../app/store'

const navItems = [
    { to: '/', label: '홈', end: true },
    { to: '/community', label: '커뮤니티' },
    { to: '/mypage', label: '마이페이지' }
]

export default function Navbar() {

    const location = useLocation() // 현재 주소를 읽어오는 훅 (react-router-dom 이 제공함)
    const isHome = location.pathname === '/'
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
    const profileImage = useSelector((state: RootState) => state.auth.profileImage)
    const [scrolled, setScrolled] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()


    useEffect(() => {

        if (!isHome) return // 조기 종료 -> 홈이 아니면 스크롤 이벤트 리스너 필요 없으므로 함수 끝냄

        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll) // cleanup 함수, 이벤트 리스너 등록 시 반드시 없애줘야 함, 안 쓰면 메모리 누수(중복 실행)
    }, [isHome])

    const isOpaque = !isHome || scrolled // 불투명해야 하는가? -> 홈이 아니면 무조건 불투명, 홈이어도 스크롤 40 이상 내렸으면 불투명 (상단 코드)

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isOpaque
                ? 'bg-pure-white/95 backdrop-blur-md border-b border-pebble'
                : 'bg-transparent'
                }`}
        >
            {/* justify-between으로 3개 그룹(로고 / 메뉴 / 우측 액션)을 양 끝 + 중앙으로 명확히 분리 */}
            <div className="max-w-[1200px] mx-auto px-10 h-[68px] flex items-center justify-between">
                {/* 그룹 1: 로고 */}
                <NavLink to="/" className="text-deep-ink font-bold text-lg tracking-wide shrink-0">
                    TRAVLAN
                </NavLink>

                {/* 그룹 2: 메뉴 - 로고/우측 그룹과 확실히 떨어지도록 gap을 넉넉하게, 메뉴 사이 간격은 그보다 좁게 */}
                <nav className="flex items-center gap-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `text-[15px] whitespace-nowrap transition-colors ${isActive ? 'text-deep-ink font-semibold' : 'text-cool-ash'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* 그룹 3: 로그인 + CTA 버튼 - 메뉴 그룹과는 별개로, 자기들끼리는 좁은 간격, shrink 0: 줄어들지 않도록 함 */}
                <div className="flex items-center gap-5 shrink-0">
                    {isLoggedIn ? (
                        <button
                            type="button"
                            onClick={() => dispatch(logout())}>로그아웃</button>
                    ) : (
                        <NavLink to="/login">로그인</NavLink>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/travels/new/map')}
                        className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
                    >
                        여행 만들기
                    </button>

                    {isLoggedIn && (
                        <button onClick={() => navigate('/mypage')} className='cursor-pointer'>
                            <div className="w-8 h-8 rounded-full bg-pebble/30 overflow-hidden flex items-center justify-center shrink-0">
                                {profileImage ? (
                                    <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-cool-ash">👤</span>
                                )}
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}