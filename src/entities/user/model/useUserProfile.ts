// 여행 작성자 정보를 가져오는 훅

import { useState, useEffect } from "react";
import { api } from "../../../shared/api/axiosInstance";
import type { UserProfile } from "../../travel/model/types";

// userId 하나 받아서 유저 이름/프로필 이미지 가져오는 훅
// 커뮤니티 카드처럼 여러 곳에서 작성자 정보 불러와야 할 경우에 씀

export function useUserProfile(userId: number | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null)

    useEffect(() => {
        // userId가 없거나(null), 실존하지 않는 유저(0 이하 - 목데이터용 임시 id)면
        // API 호출 자체를 하지 않음. 커뮤니티 비로그인 미리보기 카드가
        // userId: -1 같은 더미값을 쓰기 때문에, 여기서 안 막으면
        // 존재하지 않는 유저를 계속 조회하다 401만 쌓이게 됨
        if (userId === null || userId <= 0) return

        const fetchProfile = async () => {
            try {
                const response = await api.get(`/users/${userId}`)
                setProfile(response.data)
            } catch (error) {
                console.log('작성자 정보 조회 실패', error)
            }
        }
        fetchProfile()
    }, [userId])

    return profile
}