import { useState } from 'react'
import { api } from '../../shared/api/axiosInstance'

export default function SignupPage() {
  // ERD 기준 회원가입 시 입력받는 필드: name, email, password
  // (provider, provider_id는 일반 가입 시 백엔드가 기본값 처리할 것으로 가정 - 확인 필요)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 요청 결과를 그대로 화면에 표시 - API 연동 확인용
  const [result, setResult] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // TODO: 실제 회원가입 엔드포인트 경로는 백엔드 확인 후 수정
      const response = await api.post('/auth/signup', { name, email, password })
      setResult(JSON.stringify(response.data))
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setResult(`에러: ${(error as Error).message}`)
      }
      console.error(error)
    }
  }

  return (
    <div className="p-8 max-w-sm">
      <h1 className="text-lg font-bold mb-4">회원가입 API 테스트</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button type="submit">
            버튼
        </button>
      </form>

      {result && (
        <pre>
          {result}
        </pre>
      )}
    </div>
  )
}