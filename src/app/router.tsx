// createBrowserRouter: 브라우저 주소창(URL)과 컴포넌트 매핑해주는 함수

import { createBrowserRouter, Outlet } from 'react-router-dom'
import Navbar from '../widgets/navbar/ui/Navbar'
import HomePage from '../pages/home/ui/HomePage'
import MainPage from '../pages/main/MainPage'
import CommunityPage from '../pages/community/ui/CommunityPage'
import MyPage from '../pages/mypage/ui/MyPage'
import TimelinePage from '../pages/timeline/ui/TimelinePage'
import LoginPage from '../pages/login/LoginPage'
import SignupPage from '../pages/login/SignupPage'
import { useKakaoLoader } from 'react-kakao-maps-sdk'


function RootLayout() {
  // 앱이 처음 로드될 때 카카오 지도 SDK를 한 번만 불러옴
  // loading: 아직 로딩 중인지, error: 로딩 실패했는지
  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
  })

  return (
    <div>
      <Navbar />
      <div className="pt-[68px]">
        <Outlet />
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> }, // '/' 정확히 일치할 때
      { path: 'travels/:travelId/map', element: <MainPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
])