// createBrowserRouter: 브라우저 주소창(URL)과 컴포넌트 매핑해주는 함수
// React.lazy + Suspense: 페이지 컴포넌트를 처음부터 다 불러오지 않고,
// 해당 라우트에 진입하는 순간에만 필요한 JS를 불러오게 해서 초기 로딩을 가볍게 함

import { createBrowserRouter, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from '../widgets/navbar/ui/Navbar'

// 페이지들을 lazy import로 변경 - 각 페이지는 실제로 그 경로에 들어갈 때만 다운로드됨
const HomePage = lazy(() => import('../pages/home/ui/HomePage'))
const MainPage = lazy(() => import('../pages/main/MainPage'))
const CommunityPage = lazy(() => import('../pages/community/ui/CommunityPage'))
const MyPage = lazy(() => import('../pages/mypage/ui/MyPage'))
const TimelinePage = lazy(() => import('../pages/timeline/ui/TimelinePage'))
const LoginPage = lazy(() => import('../pages/login/LoginPage'))
const SignupPage = lazy(() => import('../pages/login/SignupPage'))
const EditProfilePage = lazy(() => import('../pages/mypage/ui/EditProfilePage'))

function RootLayout() {
  // 카카오맵 SDK 로딩(useKakaoLoader)은 여기서 하지 않음 - 지도를 실제로 쓰는
  // KakaoMap 컴포넌트 안으로 옮겨서, 지도가 필요 없는 페이지는 이 무거운 스크립트를
  // 아예 안 불러오도록 함 (홈페이지 진입이 느렸던 원인 중 하나)

  return (
    <div>
      <Navbar />
      <div className="pt-[68px]">
        {/* Suspense: lazy 컴포넌트가 로딩되는 동안 보여줄 화면.
            페이지 전환 시 아주 잠깐 뜨는 정도라 null로 비워둬도 되고,
            깜빡임이 거슬리면 아래처럼 간단한 로딩 표시를 넣어도 됨 */}
        <Suspense fallback={<div className="flex justify-center py-32 text-sm text-cool-ash">불러오는 중...</div>}>
          <Outlet />
        </Suspense>
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
      { path: 'timeline/:travelId', element: <TimelinePage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'mypage/edit', element: <EditProfilePage /> }
    ],
  },
])