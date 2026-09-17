import { useState } from 'react'
import { api } from '../../shared/api/axiosInstance'
import { useNavigate } from 'react-router-dom'


export default function SignupPage() {
  // ERD 기준 회원가입 시 입력받는 필드: name, email, password
  // (provider, provider_id는 일반 가입 시 백엔드가 기본값 처리할 것으로 가정 - 확인 필요)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 성공 시 로그인 페이지로 이동, 실패 시 에러 메시지 발생 useState
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handleSendToLogin = () => {
    navigate('/login')
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post('/auth/signup', { name, email, password })
      navigate('/login')
    } catch (error) {
      setError('입력하신 정보를 다시 확인해주세요.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white">
      <div className="w-full max-w-sm border border-pebble p-8">
        <h1 className="text-2xl font-bold text-deep-ink mb-8 text-center">회원가입</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <button 
          type="submit"
          className="rounded-pill bg-deep-ink text-pure-white py-3 text-sm font-semibold mt-2">
            회원가입
          </button>
        </form>

        <button
        onClick={handleSendToLogin}
        className="w-full text-center text-sm text-cool-ash mt-4"
        >
          이미 계정이 있으신가요? <span className="text-deep-ink font-semibold">로그인</span>
        </button>

        {error && (
          <p className="text-sm text-red-500 font-semibold mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}