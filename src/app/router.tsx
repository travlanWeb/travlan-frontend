// createBrowserRouter: 브라우저 주소창(URL)과 컴포넌트 매핑해주는 함수

import { createBrowserRouter, Outlet } from 'react-router-dom'
import Header from '../widgets/header/Header'
import HomePage from '../pages/home/ui/HomePage'
import MainPage from '../pages/main/MainPage'
import TimelinePage from '../pages/timeline/TimelinePage'
import CommunityPage from '../pages/community/CommunityPage'
import MyPage from '../pages/mypage/MyPage'
import LoginPage from '../pages/login/LoginPage'

// 기존 페이지들이 공유하던 레이아웃 (Header + Outlet)
// 홈 화면은 Navbar를 자체적으로 포함하고 있어서 이 레이아웃을 쓰지 않음
function RootLayout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

export const router = createBrowserRouter([
  // 홈 화면: 독립된 라우트. Header 공통 레이아웃을 거치지 않고
  // HomePage 안에서 Navbar를 직접 렌더링함
  { path: '/', element: <HomePage /> },

  // 나머지 페이지들: 기존처럼 Header + Outlet 레이아웃 공유
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // 기존 '/'(지도)가 여기로 이동. travelId는 지금 하드코딩된 값만 들어옴
      { path: 'travels/:travelId/map', element: <MainPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
])