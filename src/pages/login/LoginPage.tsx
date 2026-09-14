import { useState } from 'react'
import { api } from '../../shared/api/axiosInstance'


export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [result, setResult] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post('/auth/login', { email, password }) // swagger 바탕으로 수정해야 함

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
      <h1 className="text-lg font-bold mb-4">로그인 API 테스트</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
          로그인 요청 보내기
        </button>
      </form>

      {/* 응답 결과를 그대로 노출 - 성공/실패 상관없이 백엔드가 뭘 돌려주는지 확인용 */}
      {result && (
        <pre>
          {result}
        </pre>
      )}
    </div>
  )
}