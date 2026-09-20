import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { updateProfile } from '../../../entities/auth/model/authSlice'
import { uploadImage } from '../../../shared/api/uploadImage'
import { getUserIdFromToken } from '../../../entities/auth/model/getUserId'
import { api } from '../../../shared/api/axiosInstance'

export default function EditProfilePage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)
    const currentName = useSelector((state: RootState) => state.auth.name)
    const currentProfileImage = useSelector((state: RootState) => state.auth.profileImage)

    const [name, setName] = useState(currentName || '')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState(currentProfileImage || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    // 파일 선택 시 미리보기 이미지 갱신
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file)) // 선택한 파일을 즉시 미리보기용 임시 URL로 변환
    }

    const handleSave = async () => {
        if (!accessToken) return
        setIsSaving(true)
        setError('')

        try {
            let newProfileImage = currentProfileImage
            if (imageFile) {
                newProfileImage = await uploadImage(imageFile)
            }

            const userId = getUserIdFromToken(accessToken)
            const response = await api.put(`/users/${userId}`, {
                name,
                profileImage: newProfileImage,
            })

            dispatch(updateProfile(response.data))
            navigate('/mypage')
        } catch (err) {
            console.error('프로필 수정 실패', err)
            setError('정보를 저장하지 못했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-[600px] mx-auto px-10 py-16">
            <h1 className="text-2xl font-bold text-deep-ink mb-8">정보 수정</h1>

            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full bg-pebble/30 overflow-hidden flex items-center justify-center text-xs text-cool-ash">
                    {previewUrl ? (
                        <img src={previewUrl} alt="프로필 미리보기" className="w-full h-full object-cover" />
                    ) : (
                        '프로필'
                    )}
                </div>
                <label className="rounded-pill border border-pebble text-deep-ink px-4 py-1.5 text-sm cursor-pointer">
                    사진 변경
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>

            <div className="mb-6">
                <label className="block text-sm text-cool-ash mb-2">이름</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-pebble px-4 py-3 text-deep-ink"
                />
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex gap-3">
                <button
                    onClick={() => navigate('/mypage')}
                    className="rounded-pill border border-pebble text-cool-ash px-6 py-2.5 text-sm font-semibold"
                >
                    취소
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-pill bg-deep-ink text-pure-white px-6 py-2.5 text-sm font-semibold"
                >
                    {isSaving ? '저장 중...' : '저장하기'}
                </button>
            </div>
        </div>
    )
}