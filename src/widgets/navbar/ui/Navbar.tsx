// widgets 레이어 -> 여러 페이지 상단에 공통으로 올라가는 네비게이션 조각, 기존 헤더와 별개
// 홈 화면에 우선 적용

// Navbar 클릭 시 새로고침 없이 화면 전환, 현재 경로와 일치 여부 알려주는 컴포넌트
// 기존 Header 가 쓰던 방식과 통합

import { NavLink } from "react-router-dom";
import { handleCreateTravel } from "../../../shared/lib/tempHandlers";

const navItems = [
    { to: '/', label: '홈', end: true },
    { to: '/travels/1/map', label: '지도' },
    { to: '/timeline', label: '타임라인' },
    { to: '/community', label: '커뮤니티' },
    { to: '/mypage', label: '마이페이지' }
]

export default function Navbar() {
    return (
        <header>
            <NavLink to="/">TRAVLAN</NavLink>
            <nav>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `text-[18px] transition-colors ${isActive ? 'text-deep-ink font-semibold' : 'text-cool-ash'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div>
                <NavLink
                    to="/login">
                    로그인
                </NavLink>

                <button
                type="button"
                onClick={handleCreateTravel}>
                    여행 만들기
                </button>
            </div>
        </header>
    )
}