// createBrowserRouter: 브라우저 주소창(URL)과 컴포넌트 매핑해주는 함수

import { createBrowserRouter } from "react-router-dom";

// 각 경로에 대응하는 페이지 컴포넌트 import
import MainPage from "../pages/main/MainPage";
import TimelinePage from "../pages/timeline/TimelinePage";
import CommunityPage from "../pages/community/CommunityPage";
import MyPage from "../pages/mypage/MyPage";
import LoginPage from "../pages/login/LoginPage";
import Header from "../widgets/header/Header";
import { Outlet } from "react-router-dom";

// path: 브라우저 주소, element: 그 주소에서 보여줄 컴포넌트
// 배열 형태로 등록해두면 router가 알아서 주소 보고 매칭


// 공통 레이아웃: Header 위에 고정
// <Outlet />이 있는 자리에 현재 경로에 맞는 페이지 컴포넌트 들어감
function RootLayout() {
    return (
        <div>
            <Header />
            <Outlet />
        </div>
    )
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <MainPage /> }, // index: '/'와 정확히 일치할 때
            { path: 'timeline', element: <TimelinePage /> },
            { path: 'community', element: <CommunityPage /> },
            { path: 'mypage', element: <MyPage /> },
            { path: 'login', element: <LoginPage /> },
        ]
    }
])