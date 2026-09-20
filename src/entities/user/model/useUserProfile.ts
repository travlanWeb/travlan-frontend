// 여행 작성자 정보를 가져오는 훅

import { useState, useEffect } from "react";
import { api } from "../../../shared/api/axiosInstance";
import type { UserProfile } from "../../travel/model/types";

// userId 하나 받아서 유저 이름/프로필 이미지 가져오는 훅
// 커뮤니티 카드처럼 여러 곳에서 작성자 정보 불러와야 할 경우에 씀

export function useUserProfile(userId: number | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null)

    useEffect(() => {
        if (userId === null) return

        const fetchProfile =  async () => {
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