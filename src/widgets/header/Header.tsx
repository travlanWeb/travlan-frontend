import { NavLink } from "react-router-dom";

const navItems = [
    { to: '/', label: '메인' },
    { to: '/timeline', label: '타임라인' },
    { to: '/community', label: '커뮤니티' },
    { to: '/mypage', label: '마이페이지' },
]

export default function Header() {
    return (
        <header>
            <span>트래블랜</span>
            <nav>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive ? 'text-primary font-semibold' : 'text-gray-600'
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* 로그인 파트 우측 끝에 배치 */}
            <NavLink
                to="/login"
                className="rounded-btn bg-primary text-white px-4 py-2 text-sm"
            >
                로그인
            </NavLink>
        </header>
    )
}