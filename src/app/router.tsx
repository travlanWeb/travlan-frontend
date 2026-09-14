// createBrowserRouter: 브라우저 주소창(URL)과 컴포넌트 매핑해주는 함수

import { createBrowserRouter, Outlet } from 'react-router-dom'
import Navbar from '../widgets/navbar/ui/Navbar'
import HomePage from '../pages/home/ui/HomePage'
import MainPage from '../pages/main/MainPage'
import TimelinePage from '../pages/timeline/TimelinePage'
import CommunityPage from '../pages/community/CommunityPage'
import MyPage from '../pages/mypage/MyPage'
import LoginPage from '../pages/login/LoginPage'

function RootLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
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
    ],
  },
])