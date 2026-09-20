// 이미지 업로드 api 함수

import { api } from './axiosInstance'

// 이미지 파일을 업로드하고 서버가 반환한 URL을 돌려주는 함수
// 프로필 사진, 여행 사진 등 여러 곳에서 재사용 가능
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file) // 백엔드가 기대하는 필드명 확인 필요 (일단 'file'로 가정)

    const response = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data.imageUrl
}