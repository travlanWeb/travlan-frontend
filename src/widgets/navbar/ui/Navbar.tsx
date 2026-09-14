// widgets 레이어 -> 여러 페이지 상단에 공통으로 올라가는 네비게이션 조각, 기존 헤더와 별개
// 홈 화면에 우선 적용

interface NavbarProps {
    alwaysOpaque?: boolean // 배경을 항상 불투명한 흰색으로 보여줄지 여부
    onNavigateMap?: () => void // 지도 페이지로 이동할 때 실행할 함수
    onCreateTravel?: () => void // // "여행 만들기" 버튼 클릭 시 실행할 함수 (지금은 임시로 콘솔 로그만 찍음)
}

export default function Navbar({ alwaysOpaque = false, onNavigateMap, onCreateTravel }: NavbarProps) {
    return(
        <header>
            {/* {워드마크 자리} */}
            <span>TRAVLAN</span>
            <nav>
                <button
                type="button"
                onClick={onNavigateMap}
                >
                    여행 만들기
                </button>
            </nav>
        </header>
    )
}